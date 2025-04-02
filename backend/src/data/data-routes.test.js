import request from "supertest";
import express from "express";
import dataRoutes from "./data-routes";
import { mockPrisma } from "../../test-setup";

const app = express();
app.use(express.json());
app.use("/data", dataRoutes);

describe("GET /data/search", () => {
  const mockFile = {
    headers: ["name", "age"],
    id: 1,
  };
  const mockEntries = [
    { id: 1, data: { name: "John", age: "30" } },
    { id: 2, data: { name: "Jane", age: "25" } },
  ];

  it("should return search results without query params", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(mockFile);
    mockPrisma.csvEntry.count.mockResolvedValue(2);
    mockPrisma.csvEntry.findMany.mockResolvedValue(mockEntries);

    const response = await request(app).get("/data/search");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      headers: mockFile.headers,
      totalCount: 2,
      dataEntries: mockEntries,
      page: 1,
      limit: 10,
    });
  });

  it("should handle exact search correctly", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(mockFile);
    mockPrisma.csvEntry.count.mockResolvedValue(0);
    mockPrisma.csvEntry.findMany.mockResolvedValue([]);

    const response = await request(app).get(
      "/data/search?term=J&column=name&exact=true"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      headers: mockFile.headers,
      totalCount: 0,
      dataEntries: [],
      page: 1,
      limit: 10,
    });
  });

  it("should handle non-exact search correctly", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(mockFile);
    mockPrisma.csvEntry.count.mockResolvedValue(2);
    mockPrisma.csvEntry.findMany.mockResolvedValue(mockEntries);

    const response = await request(app).get(
      "/data/search?term=J&column=name&exact=false"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      headers: mockFile.headers,
      totalCount: 2,
      dataEntries: mockEntries,
      page: 1,
      limit: 10,
    });
  });

  it("should return 404 when no CSV file exists", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(null);
    const response = await request(app).get("/data/search");
    expect(response.status).toBe(404);
  });

  it("should return 400 when searching with term but no column", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(mockFile);
    const response = await request(app).get("/data/search?term=John");
    expect(response.status).toBe(400);
  });

  it("should return 400 for invalid page number", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(mockFile);
    const response = await request(app).get("/data/search?page=0");
    expect(response.status).toBe(400);
  });

  it("should return 400 for invalid limit", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(mockFile);
    const response = await request(app).get("/data/search?limit=0");
    expect(response.status).toBe(400);
  });

  it("should return 400 when searching with invalid column", async () => {
    mockPrisma.csvFile.findFirst.mockResolvedValue(mockFile);
    const response = await request(app).get(
      "/data/search?term=John&column=email"
    );
    expect(response.status).toBe(400);
  });
});

describe("POST /data/upload", () => {
  const csvContent = "name,age\nJohn,30\nJane,25";
  it("should handle successful CSV upload", async () => {
    mockPrisma.$transaction.mockImplementation((cb) => cb(mockPrisma));
    mockPrisma.csvFile.create.mockResolvedValue({ id: 1 });
    mockPrisma.csvEntry.createMany.mockResolvedValue({ count: 2 });

    const response = await request(app)
      .post("/data/upload")
      .attach("file", Buffer.from(csvContent), {
        filename: "test.csv",
        contentType: "text/csv",
      });

    expect(mockPrisma.csvFile.create).toHaveBeenCalled();
    expect(mockPrisma.csvEntry.createMany).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      rowCount: 2, // Assuming 2 rows in the CSV, including the header
      headers: ["name", "age"],
    });
  });

  it("should return 400 when no file is provided", async () => {
    const response = await request(app).post("/data/upload");
    expect(response.status).toBe(400);
  });

  it("should return 400 for non-CSV file", async () => {
    const response = await request(app)
      .post("/data/upload")
      .attach("file", Buffer.from("test"), {
        filename: "test.txt",
        contentType: "text/plain",
      });
    expect(response.status).toBe(400);
  });
});
