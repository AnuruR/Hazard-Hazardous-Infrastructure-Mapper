import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb://ruthiraka2003_db_user:grs1yqWSKURoHBRJ@ac-4zee7wd-shard-00-00.gsyiaqu.mongodb.net:27017,ac-4zee7wd-shard-00-01.gsyiaqu.mongodb.net:27017,ac-4zee7wd-shard-00-02.gsyiaqu.mongodb.net:27017/?ssl=true&replicaSet=atlas-fk6cmt-shard-0&authSource=admin&appName=Cluster0";
console.log("My URI is:", uri);
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
