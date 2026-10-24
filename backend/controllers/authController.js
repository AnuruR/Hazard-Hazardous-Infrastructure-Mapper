import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
} from "../models/User.js";

const scrypt = promisify(scryptCallback);

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const key = await scrypt(password, salt, 64);
  return { salt, hash: key.toString("hex") };
}

async function passwordMatches(password, user) {
  const key = await scrypt(password, user.passwordSalt, 64);
  const expected = Buffer.from(user.passwordHash, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

const publicUser = ({ _id, username, email }) => ({ _id, username, email });

export async function register(req, res) {
  const username = req.body?.username?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!username || !email || typeof password !== "string") {
    return res.status(400).json({ message: "Username, email, and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  try {
    if (await findUserByUsername(username) || await findUserByEmail(email)) {
      return res.status(409).json({ message: "Username or email is already registered." });
    }

    const { salt, hash } = await hashPassword(password);
    const user = await createUser({
      username,
      email,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date(),
    });
    return res.status(201).json({ message: "Account created.", user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username or email is already registered." });
    }
    console.error("Registration failed:", error);
    return res.status(500).json({ message: "Could not create account." });
  }
}

export async function login(req, res) {
  const username = req.body?.username?.trim();
  const password = req.body?.password;
  if (!username || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await findUserByUsername(username);
    if (!user || !(await passwordMatches(password, user))) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    return res.json({ message: "Login successful.", user: publicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Could not log in." });
  }
}
