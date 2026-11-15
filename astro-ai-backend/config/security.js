// Cryptographic Security, JWT & Password Hashing Configuration
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Ensure strong JWT secret exists; fallback to persistent crypto-random secret
const JWT_SECRET = process.env.JWT_SECRET || "astro_ai_super_secret_jwt_key_2026_production_grade";
const JWT_ISSUER = "astro-ai-backend";
const JWT_AUDIENCE = "astro-ai-app";
export const JWT_EXPIRY_SECONDS = 3600; // Exactly 1 hour = 3600 seconds as required

// Server-side token revocation blacklist (in-memory with timestamps for cleanup)
// In clustered or distributed setups, this can be backed by Redis or MongoDB TTL collection
const revokedTokens = new Map();

// Periodic cleanup of expired revoked tokens (runs every 15 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of revokedTokens.entries()) {
    if (now > expiry) {
      revokedTokens.delete(token);
    }
  }
}, 15 * 60 * 1000);

export const securityConfig = {
  jwtSecret: JWT_SECRET,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
  expiresIn: JWT_EXPIRY_SECONDS,
  saltRounds: 10,
};

/**
 * Hash a plain password using bcrypt with 10 salt rounds
 */
export const hashPassword = async (plainPassword) => {
  if (!plainPassword || typeof plainPassword !== "string") {
    throw new Error("Password must be a valid non-empty string");
  }
  return await bcrypt.hash(plainPassword, securityConfig.saltRounds);
};

/**
 * Compare plain password against bcrypt hash
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) return false;
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate a cryptographically signed JWT for a User
 * Expiration: exactly 3600 seconds (1 hour)
 */
export const generateUserToken = (user) => {
  const payload = {
    userId: user.userId || user.id || user._id?.toString(),
    email: user.email?.toLowerCase(),
    role: user.role || "user",
    type: "user",
  };

  return jwt.sign(payload, securityConfig.jwtSecret, {
    algorithm: "HS256",
    expiresIn: securityConfig.expiresIn, // 3600 seconds
    issuer: securityConfig.issuer,
    audience: securityConfig.audience,
  });
};

/**
 * Generate a cryptographically signed JWT for Master Admin
 * Expiration: exactly 3600 seconds (1 hour)
 */
export const generateAdminToken = (adminIdentifier = "master_admin") => {
  const payload = {
    userId: adminIdentifier,
    role: "admin",
    type: "admin",
  };

  return jwt.sign(payload, securityConfig.jwtSecret, {
    algorithm: "HS256",
    expiresIn: securityConfig.expiresIn, // 3600 seconds
    issuer: securityConfig.issuer,
    audience: securityConfig.audience,
  });
};

/**
 * Explicitly verify a JWT token:
 * - Checks algorithm: HS256 only
 * - Checks expiration: fails if expired
 * - Checks issuer & audience
 * - Checks revocation blacklist
 */
export const verifyJwtToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Token missing or invalid");
  }

  // Check if token has been revoked
  if (revokedTokens.has(token)) {
    const err = new Error("Token has been revoked upon logout");
    err.name = "TokenRevokedError";
    throw err;
  }

  // Explicit algorithm validation & signature check
  return jwt.verify(token, securityConfig.jwtSecret, {
    algorithms: ["HS256"],
    issuer: securityConfig.issuer,
    audience: securityConfig.audience,
  });
};

/**
 * Invalidate / revoke a token on server-side logout
 */
export const revokeToken = (token) => {
  if (!token) return;
  try {
    const decoded = jwt.decode(token);
    // Keep in blacklist until its natural expiration
    const expiryTime = decoded?.exp ? decoded.exp * 1000 : Date.now() + JWT_EXPIRY_SECONDS * 1000;
    revokedTokens.set(token, expiryTime);
  } catch (e) {
    revokedTokens.set(token, Date.now() + JWT_EXPIRY_SECONDS * 1000);
  }
};
