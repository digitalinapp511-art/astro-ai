// Central Authentication & Role-Based Access Control (RBAC) Middleware
import { verifyJwtToken } from "../config/security.js";
import { UserModel } from "../models/User.js";

/**
 * Require valid JWT authentication (User or Admin)
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required. Please provide a valid Bearer token.",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyJwtToken(token);
    } catch (tokenErr) {
      if (tokenErr.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Your session token has expired after 1 hour. Please login again.",
        });
      }
      if (tokenErr.name === "TokenRevokedError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_REVOKED",
          message: "Session token was logged out and is no longer valid.",
        });
      }
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid or tampered authentication token.",
      });
    }

    // Check account status if user token
    if (decoded.userId && decoded.role !== "admin") {
      const user = await UserModel.findById(decoded.userId);
      if (user && user.isBanned) {
        return res.status(403).json({
          success: false,
          code: "ACCOUNT_BANNED",
          message: "Your account has been suspended by an administrator.",
        });
      }
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    console.error("🔒 [Auth Middleware Exception]:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal authentication error",
    });
  }
};

/**
 * Require Admin Role (RBAC)
 */
export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === "admin") {
      return next();
    }
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "Access Denied! Administrator privileges required.",
    });
  });
};

/**
 * Optional Auth (attaches req.user if token present, but does not block guests)
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = verifyJwtToken(token);
      req.user = decoded;
      req.token = token;
    } catch (e) {
      // Ignore invalid optional tokens
    }
  }
  next();
};
