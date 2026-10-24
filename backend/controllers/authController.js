import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
} from "../models/User.js";

const scrypt = promisify(scryptCallback);

function createAccessToken(user) {
  const secret = process.env.AUTH_TOKEN_SECRET || "development-only-change-this-secret";
  const payload = Buffer.from(JSON.stringify({
    sub: String(user._id),
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

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
    return res.status(201).json({ message: "Account created.", user: publicUser(user), token: createAccessToken(user) });
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
    return res.json({ message: "Login successful.", user: publicUser(user), token: createAccessToken(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Could not log in." });
  }
}

export function currentUser(req, res) {
  return res.json({ user: { _id: req.auth.sub, username: req.auth.username } });
}

export function memberFeatures(_req, res) {
  return res.json({ features: [
    { id: "saved-locations", name: "Saved locations", description: "Keep important places close at hand." },
    { id: "community-reports", name: "Community hazard reports", description: "Share and review reports from the community." },
    { id: "alerts", name: "Location alerts", description: "Get notified about hazards near selected places." },
  ] });
}
