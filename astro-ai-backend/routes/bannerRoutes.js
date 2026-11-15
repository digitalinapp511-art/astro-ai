import express from "express";
import {
  getBanners,
  createBanner,
  toggleBannerStatus,
  deleteBanner,
} from "../controllers/bannerController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: View active homepage banners
router.get("/", getBanners);

// Admin Only: Add, toggle, and delete banners
router.post("/", requireAdmin, createBanner);
router.patch("/:id/status", requireAdmin, toggleBannerStatus);
router.delete("/:id", requireAdmin, deleteBanner);

export default router;
