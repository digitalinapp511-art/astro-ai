import express from "express";
import {
  getMandateConfig,
  updateMandateConfig,
  createMandateOrder,
  verifyMandate,
  cancelMandate,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/config", getMandateConfig);
router.put("/config", updateMandateConfig);

// Create Mandate / Order
router.post("/create-mandate", createMandateOrder);
router.post("/create-order", createMandateOrder);

// Verify Payment / Mandate
router.post("/verify-mandate", verifyMandate);
router.post("/verify-payment", verifyMandate);

// Cancel Mandate
router.post("/cancel-mandate", cancelMandate);

export default router;
