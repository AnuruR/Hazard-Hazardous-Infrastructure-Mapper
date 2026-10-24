import { createHmac, timingSafeEqual } from "node:crypto";

const tokenSecret = () => process.env.AUTH_TOKEN_SECRET || "development-only-change-this-secret";

export function requireAuth(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  const [payload, suppliedSignature, extra] = token?.split(".") || [];
  if (!payload || !suppliedSignature || extra) {
    return res.status(401).json({ message: "Sign in to access this feature." });
  }

  const expected = createHmac("sha256", tokenSecret()).update(payload).digest();
  let supplied;
  try {
    supplied = Buffer.from(suppliedSignature, "base64url");
  } catch {
    supplied = Buffer.alloc(0);
  }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return res.status(401).json({ message: "Your session is invalid. Please sign in again." });
  }

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!claims.sub || !claims.username || claims.exp <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }
    req.auth = claims;
    return next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid. Please sign in again." });
  }
}
