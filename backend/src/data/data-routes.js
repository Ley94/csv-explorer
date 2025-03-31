import { Router } from "express";
import multer from "multer";
import csvParser from "csv-parser";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const dataRoutes = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

dataRoutes.get("/search", async (req, res) => {
  try {
    const csvFile = await prisma.csvFile.findFirst();
    if (!csvFile) {
      return res.status(404).json({ error: "No CSV file uploaded yet" });
    }

    let { term, column, exact = true, page = 1, limit = 10 } = req.query;

    if (term && (!column || !csvFile.headers.includes(column))) {
      return res.status(400).json({ error: "Invalid column name" });
    }
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
      return res.status(400).json({ error: "Invalid page or limit" });
    }

    exact = exact === true || exact === "true";

    const skip = (page - 1) * limit;

    const totalCount = await prisma.csvEntry.count({
      where: term
        ? {
            data: {
              path: [column],
              ...(exact ? { equals: term } : { string_contains: term }),
            },
          }
        : undefined,
    });

    const csvEntries = await prisma.csvEntry.findMany({
      where: term
        ? {
            data: {
              path: [column],
              ...(exact ? { equals: term } : { string_contains: term }),
            },
          }
        : undefined,
      orderBy: {
        id: "asc",
      },
      skip,
      take: parseInt(limit),
    });

    return res.json({
      headers: csvFile.headers,
      totalCount,
      dataEntries: csvEntries,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

dataRoutes.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  if (!req.file.mimetype.includes("csv"))
    return res.status(400).json({ error: "File must be a CSV file" });

  const results = [];
  let headers = [];

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on("headers", (h) => {
      headers = h;
      if (headers.length === 0) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        return res.status(400).json({ error: "No file uploaded" });
      }
    })
    .on("data", (data) => {
      const rowEntries = Object.keys(data);
      if (rowEntries.length !== headers.length) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        return res
          .status(400)
          .json({ error: "Inconsistent number of columns" });
      }

      for (let i = 0; i < headers.length; i++) {
        if (!data[headers[i]] || data[headers[i]].trim() === "") {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
          return res
            .status(400)
            .json({ error: `Empty value found in column ${headers[i]}` });
        }
      }

      results.push(data);
    })
    .on("end", async () => {
      if (results.length === 0) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        return res.status(400).json({ error: "CSV file is empty" });
      }

      try {
        // Delete existing CSV data to maintain single-file storage
        await prisma.csvFile.deleteMany();
        await prisma.csvEntry.deleteMany();

        await prisma.$transaction(async (tx) => {
          // Create the file first
          const file = await tx.csvFile.create({
            data: {
              fileName: req.file.originalname,
              headers,
              rowCount: results.length,
            },
          });

          // Create all rows for this file
          await tx.csvEntry.createMany({
            data: results.map((row) => ({
              data: row,
              fileId: file.id,
            })),
          });
        });

        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });

        return res.status(201).json({
          message: "File uploaded successfully",
          rowCount: results.length,
          headers,
        });
      } catch (error) {
        console.error("Error saving data to database:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    })
    .on("error", (_error) => {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return res.status(500).json({ error: "Internal server error" });
    });
});

export default dataRoutes;
