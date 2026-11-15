// User Profile and Session Controller (Secured with Cryptographic JWT & Password Hashing)
import { UserModel, sanitizeUser } from "../models/User.js";
import {
  generateUserToken,
  comparePassword,
  hashPassword,
  revokeToken,
  JWT_EXPIRY_SECONDS,
} from "../config/security.js";

/**
 * GET All Users (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST Login User
 * Generates 1-hour JWT token and verifies password with bcrypt
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    // Retrieve user including password field for verification
    const userWithPassword = await UserModel.findByEmail(cleanEmail, true);

    if (!userWithPassword) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "No account found with this email. Please Sign Up first.",
      });
    }

    if (userWithPassword.isBanned) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_BANNED",
        message: "This account has been suspended.",
      });
    }

    // Verify password if account has a password set
    if (userWithPassword.password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          code: "PASSWORD_REQUIRED",
          message: "Password is required for this account.",
        });
      }

      let isMatch = false;
      const isBcrypt = userWithPassword.password.startsWith("$2a$") || userWithPassword.password.startsWith("$2b$");

      if (isBcrypt) {
        isMatch = await comparePassword(password, userWithPassword.password);
      } else {
        // Transparent upgrade: legacy plaintext password matched, convert to bcrypt hash
        if (userWithPassword.password === password) {
          isMatch = true;
          const upgradedHash = await hashPassword(password);
          await UserModel.updatePassword(userWithPassword.userId, upgradedHash);
          console.log(`🔐 [Security Upgrade] Transparently upgraded legacy password for: ${cleanEmail}`);
        }
      }

      if (!isMatch) {
        console.warn(`⚠️ [Security Alert] Failed login attempt for: ${cleanEmail} from IP: ${req.ip}`);
        return res.status(401).json({
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Incorrect password. Please try again.",
        });
      }
    }

    const safeUser = sanitizeUser(userWithPassword);
    // Generate signed JWT token with exactly 3600 seconds (1 hour) expiration
    const token = generateUserToken(safeUser);

    console.log(`🌿 [Auth] User logged in: ${safeUser.name} (${safeUser.email})`);

    res.json({
      success: true,
      message: "Login successful!",
      user: safeUser,
      token,
      expiresIn: JWT_EXPIRY_SECONDS, // 3600 seconds
      tokenType: "Bearer",
    });
  } catch (err) {
    console.error("⚠️ [Auth] Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error during login" });
  }
};

/**
 * POST Signup / Register User
 */
export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "A valid email address is required" });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0]).trim();

    const existingUser = await UserModel.findByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "USER_ALREADY_EXISTS",
        message: "Account already exists with this email. Please Login instead.",
      });
    }

    console.log(`🌿 [Auth] Registering user: ${cleanName} (${cleanEmail})`);

    // Strictly enforce role: "user" (Mass-Assignment Protection)
    const newUser = await UserModel.create({
      name: cleanName,
      email: cleanEmail,
      password: password || "",
      role: "user",
    });

    const safeUser = sanitizeUser(newUser);
    const token = generateUserToken(safeUser);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: safeUser,
      token,
      expiresIn: JWT_EXPIRY_SECONDS,
      tokenType: "Bearer",
    });
  } catch (err) {
    console.error("⚠️ [Auth] Signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error during registration" });
  }
};

/**
 * POST Logout User (Server-Side JWT Invalidation)
 */
export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      revokeToken(token);
    }
    res.json({
      success: true,
      message: "Session successfully invalidated and logged out.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET Verify Active Session
 */
export const verifySession = async (req, res) => {
  try {
    // req.user is already validated and decoded by requireAuth middleware
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      message: "Session is active and valid.",
      user: sanitizeUser(user),
      tokenUser: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT Update User Profile Name (Protected against IDOR)
 */
export const updateUserName = async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Valid name is required" });
    }

    // IDOR Enforcement: User can only rename their own account unless admin
    const targetUserId = userId || req.user.userId;
    if (req.user.role !== "admin" && req.user.userId !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot modify another user's profile.",
      });
    }

    const updated = await UserModel.updateName(targetUserId, name.trim());
    res.json({ success: true, name: updated?.name || name.trim() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST Add Bonus Balance (Admin Only)
 */
export const addBonusBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const user = await UserModel.addBonus(id, amount);
    if (user) return res.json({ success: true, walletBalance: user.walletBalance });
    res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT Toggle Ban User (Admin Only)
 */
export const toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.toggleBan(id);
    if (user) return res.json({ success: true, isBanned: user.isBanned });
    res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
