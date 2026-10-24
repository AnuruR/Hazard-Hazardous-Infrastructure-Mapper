import { MongoClient } from "mongodb";

let client;
let db;

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI must be set in backend/.env (see backend/.env.example).");

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME || "hazard_mapper");
  await db.collection("users").createIndexes([
    { key: { username: 1 }, unique: true },
    { key: { email: 1 }, unique: true },
  ]);
  console.log("Connected to MongoDB.");
  return db;
}

export function getDB() {
  if (!db) throw new Error("MongoDB is not connected.");
  return db;
}
