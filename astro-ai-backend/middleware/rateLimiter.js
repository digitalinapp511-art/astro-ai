// Rate Limiting & Brute-Force Protection
import rateLimit from "express-rate-limit";

/**
 * Strict Rate Limiter for Authentication & Admin Login
 * Limits to 10 requests per 15 minutes per IP to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many login/auth attempts from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Rate Limiter for AI Chat Queries (prevents automated scraping & quota exhaustion)
 * Limits to 30 requests per minute
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many AI requests. Please wait a moment before sending another query.",
  },
});

/**
 * General API Rate Limiter
 * 200 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many API requests from this IP. Please try again later.",
  },
});
