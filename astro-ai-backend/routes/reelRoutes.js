import express from "express";
import {
  getAllReels,
  publishReel,
  deleteReel,
  deleteSeries,
  likeReel,
  uploadVideoToCloudinary,
  upload,
} from "../controllers/reelController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: View reels & like
router.get("/", getAllReels);
router.post("/:id/like", likeReel);

// Admin Only: Video upload, publishing, and deletion
router.post("/upload", requireAdmin, upload.single("video"), uploadVideoToCloudinary);
router.post("/", requireAdmin, publishReel);
router.delete("/series/:seriesName", requireAdmin, deleteSeries);
router.delete("/:id", requireAdmin, deleteReel);

export default router;
