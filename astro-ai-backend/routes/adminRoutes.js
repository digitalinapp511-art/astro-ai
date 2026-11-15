import express from "express";
import {
  adminLogin,
  changeAdminPin,
  getAdminAnalytics,
  getAIPersonas,
  addAIPersona,
  deleteAIPersona,
  broadcastNotification,
  wipeAllData,
} from "../controllers/adminController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public: Login endpoint with Master PIN protected by rate limiter against brute-force
router.post("/login", authLimiter, adminLogin);

// Protected: All management operations strictly require valid Admin JWT Token
router.post("/change-pin", verifyAdmin, changeAdminPin);
router.get("/analytics", verifyAdmin, getAdminAnalytics);
router.get("/ai-bots", verifyAdmin, getAIPersonas);
router.post("/ai-bots", verifyAdmin, addAIPersona);
router.delete("/ai-bots/:id", verifyAdmin, deleteAIPersona);
router.post("/broadcast", verifyAdmin, broadcastNotification);
router.post("/wipe-data", verifyAdmin, wipeAllData);

export default router;
