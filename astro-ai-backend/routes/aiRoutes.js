import express from "express";
import { chatWithAIAstrologer } from "../controllers/aiController.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// POST /api/v1/ai/chat (Rate limited against automated scraping and quota abuse)
router.post("/chat", aiLimiter, chatWithAIAstrologer);

export default router;
