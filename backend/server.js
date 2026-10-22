import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const dbName = "Hazard";

async function main() {
  try {
    //connect to atlas
    await client.connect();
    // Creates the database 'hazard_mapper' if it doesn't exist
    //db = client.db('hazard_mapper');
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

app.get("/", (req, res) => {
  res.send("Hazard Mapper API is running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
