import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// Load backend/.env regardless of the directory used to start Node.
dotenv.config({ path: new URL("./.env", import.meta.url) });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Hazard Mapper API is running." });
});
app.use("/api", authRoutes);

const port = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(port, () => console.log(`API listening on port ${port}`));
} catch (error) {
  console.error("Could not start API:", error.message);
  process.exit(1);
}
