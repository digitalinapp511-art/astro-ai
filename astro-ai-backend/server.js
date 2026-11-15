import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAdmin } from "./middleware/auth.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Models for Database Aggregate Metrics
import { UserModel } from "./models/User.js";
import { AstrologerModel } from "./models/Astrologer.js";
import { MandateModel } from "./models/Mandate.js";
import { ReelModel } from "./models/Reel.js";
import { PoojaModel, AppointmentModel } from "./models/Pooja.js";

// Feature Routes
import astrologerRoutes from "./routes/astrologerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import reelRoutes from "./routes/reelRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import poojaRoutes from "./routes/poojaRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB Database
connectDB();

// 1. Secure HTTP Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by Next.js frontend
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Strict CORS Configuration (No wildcard origin for authenticated APIs)
const allowedOrigins = [
  "https://www.uurja.in",
  "https://uurja.in",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server curl, postman in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Access from origin not allowed."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-admin-pin",
      "X-Requested-With",
      "Accept",
    ],
  })
);

// 3. Request Body Size Limit (Prevent buffer overflow / Denial of Service)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 4. NoSQL Query Injection Protection (Strip $ and . prefixes)
app.use(mongoSanitize());

// 5. Global API Rate Limiter
app.use("/api/v1", apiLimiter);

// 6. Sanitized Request Logger (Never logs passwords, tokens, or PII)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `📡 [API] ${req.method} ${req.originalUrl} ➔ ${res.statusCode} (${duration}ms) [IP: ${req.ip || "unknown"}]`
    );
  });
  next();
});

// Base Public Health Check (Safe: No internal hosts or credentials disclosed)
app.get("/", (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "success",
    service: "AstroAI Production Backend",
    database: isMongoConnected ? "Connected" : "Fallback Store Active",
    version: "2.1.0",
    timestamp: new Date().toISOString(),
  });
});

// Protected Database Metrics Endpoint (Requires Master Admin JWT)
app.get("/api/v1/database/status", requireAdmin, async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const [users, poojas, appointments, astrologers, reels] = await Promise.all([
      UserModel.find().catch(() => []),
      PoojaModel.find().catch(() => []),
      AppointmentModel.find().catch(() => []),
      AstrologerModel.find().catch(() => []),
      ReelModel.find().catch(() => []),
    ]);

    // Aggregate statistics ONLY - Zero PII or credentials exposed
    res.json({
      success: true,
      connectionStatus: isMongoConnected ? "Live Connected" : "Local Storage Active",
      databaseName: isMongoConnected ? mongoose.connection.name : "local",
      recordsCount: {
        totalUsers: users.length,
        totalAstrologers: astrologers.length,
        totalPoojas: poojas.length,
        totalAppointments: appointments.length,
        activeMandates: MandateModel.findSubscriptions().length,
        reelsVideos: reels.length,
      },
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not retrieve status metrics" });
  }
});

// Mount Routes
app.use("/api/v1/astrologers", astrologerRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/reels", reelRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/poojas", poojaRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AstroAI Hardened Security Backend running on: http://localhost:${PORT}`);
  console.log(`🔒 Cryptographic JWT (1-Hour Expiration) & RBAC Active`);
  console.log(`🛡️ Rate Limiting, Helmet Security Headers, and NoSQL Sanitization Enabled`);
});
