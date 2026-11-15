import express from "express";
import {
  getAllUsers,
  loginUser,
  signupUser,
  logoutUser,
  verifySession,
  updateUserName,
  addBonusBalance,
  toggleBanUser,
} from "../controllers/userController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public auth endpoints protected by rate limiting against brute force
router.post("/login", authLimiter, loginUser);
router.post("/signup", authLimiter, signupUser);
router.post("/register", authLimiter, signupUser);

// Protected user session endpoints (require valid 1-hour JWT token)
router.post("/logout", requireAuth, logoutUser);
router.get("/verify-session", requireAuth, verifySession);
router.put("/profile/name", requireAuth, updateUserName);

// Administrative endpoints (strictly require Admin role)
router.get("/", requireAdmin, getAllUsers);
router.post("/:id/bonus", requireAdmin, addBonusBalance);
router.put("/:id/ban", requireAdmin, toggleBanUser);

export default router;
