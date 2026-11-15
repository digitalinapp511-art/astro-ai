import express from "express";
import {
  getMandateConfig,
  updateMandateConfig,
  createMandateOrder,
  verifyMandate,
  cancelMandate,
} from "../controllers/subscriptionController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: Get current mandate config & Razorpay Key
router.get("/config", getMandateConfig);

// Admin Only: Update VIP pricing & trial duration
router.put("/config", requireAdmin, updateMandateConfig);

// Create Mandate / Order (Razorpay)
router.post("/create-mandate", createMandateOrder);
router.post("/create-order", createMandateOrder);

// Verify Payment / Mandate (Strict HMAC-SHA256 signature verification)
router.post("/verify-mandate", verifyMandate);
router.post("/verify-payment", verifyMandate);

// Cancel Mandate
router.post("/cancel-mandate", cancelMandate);

export default router;
