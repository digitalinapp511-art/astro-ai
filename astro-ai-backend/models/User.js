// User Data Model & MongoDB Atlas Mongoose Integration (Hardened)
import mongoose from "mongoose";
import { loadData, saveData } from "../config/fileDb.js";
import { hashPassword } from "../config/security.js";

const DEFAULT_USERS = [
  {
    id: "u-1",
    userId: "u-1",
    name: "Abhay Saini",
    email: "sainiabhay070@gmail.com",
    role: "admin",
    joinedDate: "12 Oct 2026",
    walletBalance: 250,
    totalConsultations: 4,
    isVIP: true,
    isBanned: false,
  },
  {
    id: "u-2",
    userId: "u-2",
    name: "Rohit Sharma",
    email: "rohit.sharma@example.com",
    role: "user",
    joinedDate: "13 Oct 2026",
    walletBalance: 0,
    totalConsultations: 1,
    isVIP: false,
    isBanned: false,
  },
  {
    id: "u-demo",
    userId: "u-demo",
    name: "Demo User",
    email: "demo@astroai.com",
    role: "user",
    joinedDate: "Today",
    walletBalance: 100,
    totalConsultations: 1,
    isVIP: true,
    isBanned: false,
  },
];

export let usersStore = loadData("users.json", DEFAULT_USERS);

// Strips sensitive fields like password before sending in API response
export const sanitizeUser = (user) => {
  if (!user) return null;
  const clean = { ...user };
  delete clean.password;
  delete clean.__v;
  return clean;
};

// 🌿 Mongoose Schema for MongoDB Atlas
const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    joinedDate: { type: String, default: "Today" },
    walletBalance: { type: Number, default: 50 },
    totalConsultations: { type: Number, default: 0 },
    isVIP: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    password: { type: String, select: false, default: "" },
  },
  { timestamps: true }
);

export const MongoUser = mongoose.models.User || mongoose.model("User", userSchema, "users");

export const UserModel = {
  find: async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        const atlasUsers = await MongoUser.find().select("-password").lean();
        if (atlasUsers && atlasUsers.length > 0) {
          return atlasUsers.map((u) => sanitizeUser({ ...u, id: u.userId || u._id.toString() }));
        }
      }
    } catch (e) {
      console.warn("⚠️ [User Model] Atlas read fallback:", e.message);
    }
    return usersStore.map(sanitizeUser);
  },

  findByEmail: async (email, includePassword = false) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (mongoose.connection.readyState === 1) {
        let query = MongoUser.findOne({ email: cleanEmail });
        if (includePassword) {
          query = query.select("+password");
        } else {
          query = query.select("-password");
        }
        const user = await query.lean();
        if (user) {
          const formatted = { ...user, id: user.userId || user._id.toString() };
          return includePassword ? formatted : sanitizeUser(formatted);
        }
      }
    } catch (e) {
      console.warn("⚠️ [User Model] Atlas findByEmail fallback:", e.message);
    }
    const local = usersStore.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!local) return null;
    return includePassword ? { ...local } : sanitizeUser(local);
  },

  findById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const user = await MongoUser.findOne({
          $or: [{ userId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
        })
          .select("-password")
          .lean();
        if (user) {
          return sanitizeUser({ ...user, id: user.userId || user._id.toString() });
        }
      }
    } catch (e) {
      console.warn("⚠️ [User Model] Atlas findById fallback:", e.message);
    }
    const local = usersStore.find((u) => u.id === id || u.userId === id);
    return sanitizeUser(local);
  },

  create: async (data) => {
    const userId = `u-${Date.now()}`;
    const cleanEmail = (data.email || `user_${Date.now()}@astroai.com`).trim().toLowerCase();
    
    // Hash password if supplied
    let hashedPassword = "";
    if (data.password && data.password.trim()) {
      hashedPassword = await hashPassword(data.password.trim());
    }

    const newUserObj = {
      userId,
      id: userId,
      name: data.name || "Seeker",
      email: cleanEmail,
      role: data.role === "admin" ? "admin" : "user", // Enforce valid role
      joinedDate: data.joinedDate || "Today",
      walletBalance: data.walletBalance !== undefined ? data.walletBalance : 50,
      totalConsultations: 0,
      isVIP: data.isVIP || false,
      isBanned: false,
      password: hashedPassword,
      avatar:
        data.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    };

    // 1. Save directly to MongoDB Atlas
    try {
      if (mongoose.connection.readyState === 1) {
        const created = await MongoUser.create(newUserObj);
        console.log(`🌿 [MongoDB Atlas] Successfully created user: ${created.name} (${created.email})`);
        newUserObj._id = created._id;
      }
    } catch (e) {
      console.warn("⚠️ [User Model] Atlas create error, writing to disk fallback:", e.message);
    }

    // 2. Keep local memory / disk store in sync
    usersStore.unshift(newUserObj);
    saveData("users.json", usersStore);
    return sanitizeUser(newUserObj);
  },

  updatePassword: async (userId, newHashedPassword) => {
    try {
      if (mongoose.connection.readyState === 1) {
        await MongoUser.updateOne(
          { $or: [{ userId }, { _id: mongoose.isValidObjectId(userId) ? userId : null }] },
          { $set: { password: newHashedPassword } }
        );
      }
    } catch (e) {}

    const local = usersStore.find((u) => u.userId === userId || u.id === userId);
    if (local) {
      local.password = newHashedPassword;
      saveData("users.json", usersStore);
    }
  },

  updateName: async (id, name) => {
    try {
      if (mongoose.connection.readyState === 1) {
        await MongoUser.updateOne(
          { $or: [{ userId: id }, { email: "sainiabhay070@gmail.com" }] },
          { $set: { name } }
        );
      }
    } catch (e) {}

    const user = usersStore.find((u) => u.id === id || u.email === "sainiabhay070@gmail.com");
    if (user) {
      user.name = name;
      saveData("users.json", usersStore);
    }
    return sanitizeUser(user);
  },

  addBonus: async (id, amount) => {
    const bonus = Number(amount) || 50;
    try {
      if (mongoose.connection.readyState === 1) {
        const updated = await MongoUser.findOneAndUpdate(
          { $or: [{ userId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { $inc: { walletBalance: bonus } },
          { new: true }
        )
          .select("-password")
          .lean();
        if (updated) return sanitizeUser({ ...updated, id: updated.userId || updated._id.toString() });
      }
    } catch (e) {}

    const user = usersStore.find((u) => u.id === id);
    if (user) {
      user.walletBalance += bonus;
      saveData("users.json", usersStore);
    }
    return sanitizeUser(user);
  },

  toggleBan: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const current = await MongoUser.findOne({
          $or: [{ userId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
        });
        if (current) {
          current.isBanned = !current.isBanned;
          await current.save();
          return sanitizeUser({ ...current.toObject(), id: current.userId || current._id.toString() });
        }
      }
    } catch (e) {}

    const user = usersStore.find((u) => u.id === id);
    if (user) {
      user.isBanned = !user.isBanned;
      saveData("users.json", usersStore);
    }
    return sanitizeUser(user);
  },

  markVIP: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        await MongoUser.updateOne(
          { $or: [{ userId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { $set: { isVIP: true } }
        );
      }
    } catch (e) {
      console.warn("⚠️ [User Model] Atlas markVIP error:", e.message);
    }

    const user = usersStore.find((u) => u.id === id || u.userId === id);
    if (user) {
      user.isVIP = true;
      saveData("users.json", usersStore);
    }
    return sanitizeUser(user);
  },
};
