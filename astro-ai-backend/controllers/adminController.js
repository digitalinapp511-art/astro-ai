// Master Admin Controller & Persistent MongoDB Atlas Security Configuration (Hardened)
import mongoose from "mongoose";
import crypto from "crypto";
import { AstrologerModel } from "../models/Astrologer.js";
import { ReelModel } from "../models/Reel.js";
import { generateAdminToken, JWT_EXPIRY_SECONDS } from "../config/security.js";
import { logSecurityEvent } from "../config/securityLogger.js";

let currentPin = process.env.ADMIN_MASTER_PIN || "";

// Retrieve current Master PIN from MongoDB Atlas or environment
export const getActiveMasterPin = async () => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const settingsCol = mongoose.connection.db.collection("settings");
      const doc = await settingsCol.findOne({ key: "admin_pin" });
      if (doc && doc.value) {
        currentPin = doc.value;
        return doc.value;
      } else if (process.env.ADMIN_MASTER_PIN) {
        // Initialize from environment into Atlas if not present
        await settingsCol.updateOne(
          { key: "admin_pin" },
          { $set: { key: "admin_pin", value: process.env.ADMIN_MASTER_PIN, updatedAt: new Date() } },
          { upsert: true }
        );
        currentPin = process.env.ADMIN_MASTER_PIN;
      }
    }
  } catch (e) {
    console.warn("⚠️ [Security] Atlas PIN read notice:", e.message);
  }
  return currentPin || process.env.ADMIN_MASTER_PIN || "";
};

// Set and Persist New Master PIN in MongoDB Atlas
export const setActiveMasterPin = async (newPin) => {
  currentPin = newPin;
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const settingsCol = mongoose.connection.db.collection("settings");
      await settingsCol.updateOne(
        { key: "admin_pin" },
        { $set: { key: "admin_pin", value: newPin, updatedAt: new Date() } },
        { upsert: true }
      );
      console.log(`🔐 [Security] Admin PIN permanently updated in MongoDB Atlas`);
    }
  } catch (e) {
    console.warn("⚠️ [Security] Could not persist PIN to Atlas:", e.message);
  }
};

let aiPersonasStore = [
  {
    id: "ai-1",
    name: "Acharya AI (Chief Vedic Pandit)",
    role: "Vedic Kundli & Dosha Specialist",
    category: "Kundli",
    avatar: "🧙‍♂️",
    tone: "Traditional Vedic & Sanskrit Mantras",
    isActive: true,
    queriesAnswered: 4890,
  },
  {
    id: "ai-2",
    name: "Dr. Ananya AI",
    role: "Love & Marriage Compatibility Guru",
    category: "Love",
    avatar: "🧕",
    tone: "Empathetic, Relationship Counseling",
    isActive: true,
    queriesAnswered: 3410,
  },
  {
    id: "ai-3",
    name: "Dev Guru AI",
    role: "Career, Wealth & Business Dhan Yog",
    category: "Career",
    avatar: "👨‍🏫",
    tone: "Practical, Career Timings & Remedies",
    isActive: true,
    queriesAnswered: 2950,
  },
  {
    id: "ai-4",
    name: "Prashna Shastra AI",
    role: "Instant Yes/No & Horary Astrology",
    category: "Prashna",
    avatar: "🔮",
    tone: "Concise, Direct & Planetary Muhurat",
    isActive: false,
    queriesAnswered: 1220,
  },
];

/**
 * POST Admin Login
 * Verifies Master PIN using constant-time string comparison to prevent timing attacks
 * Returns a cryptographically signed Admin JWT token valid for exactly 1 hour
 */
export const adminLogin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== "string") {
      return res.status(400).json({ success: false, message: "Security PIN is required." });
    }

    const activePin = await getActiveMasterPin();

    // Constant-time buffer comparison to prevent timing-attack vulnerability
    const pinBuffer = Buffer.from(pin.trim());
    const activeBuffer = Buffer.from(activePin.trim());

    const isMatch =
      pinBuffer.length === activeBuffer.length &&
      crypto.timingSafeEqual(pinBuffer, activeBuffer);

    if (!isMatch) {
      logSecurityEvent("ADMIN_PIN_FAILED", {
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(401).json({ success: false, message: "Invalid Security PIN!" });
    }

    // Generate real signed Admin JWT (valid for 3600 seconds)
    const adminToken = generateAdminToken("master_admin");
    logSecurityEvent("ADMIN_LOGIN_SUCCESS", {
      ip: req.ip,
      requestId: req.id,
    });

    return res.json({
      success: true,
      token: adminToken,
      expiresIn: JWT_EXPIRY_SECONDS, // 3600 seconds
      tokenType: "Bearer",
      message: "Admin unlocked successfully!",
    });
  } catch (err) {
    console.error("⚠️ [Admin Login Error]:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changeAdminPin = async (req, res) => {
  try {
    const { currentPin: enteredCurrentPin, newPin } = req.body;
    const activePin = await getActiveMasterPin();

    if (!enteredCurrentPin || enteredCurrentPin.trim() !== activePin.trim()) {
      logSecurityEvent("ADMIN_PIN_CHANGE_REJECTED", {
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(400).json({ success: false, message: "Current Security PIN galat hai!" });
    }

    if (!newPin || newPin.trim().length < 4) {
      return res.status(400).json({ success: false, message: "Naya PIN kam se kam 4 digit ka hona chahiye!" });
    }

    await setActiveMasterPin(newPin.trim());
    logSecurityEvent("ADMIN_PIN_CHANGED", {
      ip: req.ip,
      requestId: req.id,
    });

    res.json({
      success: true,
      message: "Security PIN MongoDB Atlas me permanently update ho gaya!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminAnalytics = (req, res) => {
  res.json({
    success: true,
    metrics: {
      totalAstrologers: 6,
      totalAIPersonas: aiPersonasStore.length,
      totalReels: 3,
      totalUsers: 4,
      activeUpiMandates: 184,
      totalRevenue: 54816,
    },
  });
};

export const getAIPersonas = (req, res) => {
  res.json({ success: true, count: aiPersonasStore.length, aiPersonas: aiPersonasStore });
};

export const addAIPersona = (req, res) => {
  const { name, role, tone, avatar } = req.body;
  const newBot = {
    id: `ai-${Date.now()}`,
    name: name || "New Vedic AI",
    role: role || "Astrology Specialist",
    category: "Vedic",
    avatar: avatar || "🤖",
    tone: tone || "Traditional Vedic",
    isActive: true,
    queriesAnswered: 0,
  };
  aiPersonasStore.unshift(newBot);
  res.status(201).json({ success: true, bot: newBot });
};

export const deleteAIPersona = (req, res) => {
  const { id } = req.params;
  aiPersonasStore = aiPersonasStore.filter((p) => String(p.id) !== String(id));
  res.json({ success: true, message: `AI Bot ${id} deleted successfully.` });
};

export const broadcastNotification = (req, res) => {
  const { title, body } = req.body;
  res.json({
    success: true,
    message: "Notification broadcasted successfully to active device tokens!",
    broadcast: { title, body, sentAt: new Date().toISOString() },
  });
};

export const wipeAllData = async (req, res) => {
  try {
    AstrologerModel.clearAll();
    ReelModel.clearAll();
    aiPersonasStore = [];

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.collection("astrologers").deleteMany({});
      await mongoose.connection.db.collection("reels").deleteMany({});
    }

    res.json({
      success: true,
      message: "Saara demo/dummy data permanently wipe kar diya gaya hai!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
