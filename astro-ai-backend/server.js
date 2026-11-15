import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import crypto from "crypto";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAdmin } from "./middleware/auth.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { logSecurityEvent } from "./config/securityLogger.js";

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

// 1. Production Reverse Proxy Trust (Required on Render & Vercel to extract true client IP for rate limiting)
app.set("trust proxy", 1);

// 2. Request Correlation ID Middleware (Distributed Tracing for Security Auditing)
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// 3. Secure HTTP Headers (Helmet Production Hardening)
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by Vercel Next.js frontend
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    frameguard: { action: "sameorigin" },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// 4. Strict CORS Configuration (Render Backend ➔ Vercel Frontend)
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const baseAllowedOrigins = [
  "https://www.uurja.in",
  "https://uurja.in",
  "https://astro-ai-frontend.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  ...envOrigins,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, server-to-server health checks)
      if (!origin) return callback(null, true);

      // Check explicit whitelist
      if (baseAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check approved Vercel Preview or Render subdomains
      if (
        /^https:\/\/astro-ai[a-zA-Z0-9_-]*\.vercel\.app$/.test(origin) ||
        /^https:\/\/astro-ai[a-zA-Z0-9_-]*\.onrender\.com$/.test(origin)
      ) {
        return callback(null, true);
      }

      logSecurityEvent("CORS_BLOCKED_ORIGIN", {
        blockedOrigin: origin,
      });

      return callback(new Error("CORS policy violation: Access from this origin is forbidden."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-admin-pin",
      "X-Requested-With",
      "X-Request-Id",
      "Accept",
    ],
  })
);

// 5. Request Body Size Limit (Prevent buffer overflow / Denial of Service)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 6. NoSQL Query Injection Protection (Strip $ and . prefixes from body/query)
app.use(mongoSanitize());

// 7. Global API Rate Limiter
app.use("/api/v1", apiLimiter);

// 8. Sanitized Request Logger (Never logs passwords, tokens, or PII)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `📡 [API] ${req.method} ${req.originalUrl} ➔ ${res.statusCode} (${duration}ms) [IP: ${req.ip || "unknown"}] [ReqID: ${req.id}]`
    );
  });
  next();
});

// Base Public Health Check (Render Health Probe)
app.get("/", (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "healthy",
    service: "AstroAI Render Production Backend",
    database: isMongoConnected ? "Connected (MongoDB Atlas)" : "Local Fallback Store",
    version: "2.2.0",
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

    // Aggregate statistics ONLY - Zero PII or database hostnames exposed
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
  console.log(`🚀 AstroAI Hardened Backend active on Port: ${PORT}`);
  console.log(`🔒 Cryptographic JWT (1-Hour Expiration) & RBAC Active`);
  console.log(`🛡️ Rate Limiting, Helmet Security Headers, and NoSQL Sanitization Enabled`);
});
