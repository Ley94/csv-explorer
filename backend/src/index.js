import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dataRoutes from "./data/data-routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/data", dataRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
