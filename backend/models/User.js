import { getDB } from "../config/db.js";

const collection = () => getDB().collection("users");

export const findUserByUsername = (username) =>
  collection().findOne({ username });

export const findUserByEmail = (email) => collection().findOne({ email });

export async function createUser(user) {
  const { insertedId } = await collection().insertOne(user);
  return { ...user, _id: insertedId };
}
