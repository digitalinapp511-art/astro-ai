import express from "express";
import {
  getAllReels,
  publishReel,
  deleteReel,
  deleteSeries,
  likeReel,
  toggleLike,
  trackView,
  trackShare,
  getReelComments,
  addReelComment,
  deleteReelComment,
  uploadVideoToCloudinary,
  upload,
} from "../controllers/reelController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: View reels, view count, like toggle, share count & comments
router.get("/", getAllReels);
router.post("/:id/view", trackView);
router.post("/:id/like", toggleLike);
router.post("/:id/share", trackShare);
router.get("/:id/comments", getReelComments);
router.post("/:id/comments", addReelComment);

// Admin Only: Video upload, publishing, deletion, and comment moderation
router.post("/upload", requireAdmin, upload.single("video"), uploadVideoToCloudinary);
router.post("/", requireAdmin, publishReel);
router.delete("/series/:seriesName", requireAdmin, deleteSeries);
router.delete("/:id/comments/:commentId", requireAdmin, deleteReelComment);
router.delete("/:id", requireAdmin, deleteReel);

export default router;
