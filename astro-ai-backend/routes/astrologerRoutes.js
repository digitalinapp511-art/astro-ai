import express from "express";
import {
  getAllAstrologers,
  addAstrologer,
  updateAstrologer,
  deleteAstrologer,
  toggleAstrologerStatus,
} from "../controllers/astrologerController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: View all astrologers
router.get("/", getAllAstrologers);

// Admin Only: Add, edit, delete, and toggle status
router.post("/", requireAdmin, addAstrologer);
router.put("/:id", requireAdmin, updateAstrologer);
router.delete("/:id", requireAdmin, deleteAstrologer);
router.patch("/:id/status", requireAdmin, toggleAstrologerStatus);

export default router;
