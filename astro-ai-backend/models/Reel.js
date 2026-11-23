// Astro Reels Store & Persistent MongoDB Atlas Model (Real-Time Metrics)
import mongoose from "mongoose";
import { loadData, saveData } from "../config/fileDb.js";

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  commentId: { type: String },
  userId: { type: String, default: "guest" },
  userName: { type: String, default: "Bhakt" },
  userAvatar: {
    type: String,
    default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const reelSchema = new mongoose.Schema(
  {
    reelId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "Daily astrological guidance & Vedic insights." },
    astrologerName: { type: String, default: "AstroAI Creator" },
    astrologerTitle: { type: String, default: "Vedic Astrologer" },
    astrologerAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    videoUrl: { type: String, default: "" },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },
    sharesCount: { type: Number, default: 0 },
    tag: { type: String, default: "#DailyUpay" },
    seriesName: { type: String, default: "" },
    seriesPart: { type: Number, default: 1 },
    dateAdded: { type: String, default: "Today" },
    isPublished: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MongoReel = mongoose.models.Reel || mongoose.model("Reel", reelSchema, "reels");

export let reelsStore = loadData("reels.json", []);

export const ReelModel = {
  find: async (query = {}, options = {}) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const { page = 1, limit = 50, sort = { createdAt: -1, _id: -1 } } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const atlasReels = await MongoReel.find({ isPublished: true, ...query })
          .sort(sort)
          .skip(skip)
          .limit(Number(limit))
          .lean();
        return (atlasReels || []).map((r) => ({
          ...r,
          id: r.reelId || r._id.toString(),
          views: Number(r.views) || 0,
          likes: Number(r.likes) || 0,
          commentsCount: Number(r.commentsCount) || (r.comments ? r.comments.length : 0),
          sharesCount: Number(r.sharesCount) || 0,
          comments: r.comments || [],
        }));
      }
    } catch (e) {
      console.warn("⚠️ [Reel Model] Atlas read fallback:", e.message);
    }
    return reelsStore || [];
  },

  findById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const r = await MongoReel.findOne({
          $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
        }).lean();
        if (r) {
          return {
            ...r,
            id: r.reelId || r._id.toString(),
            views: Number(r.views) || 0,
            likes: Number(r.likes) || 0,
            commentsCount: Number(r.commentsCount) || (r.comments ? r.comments.length : 0),
            sharesCount: Number(r.sharesCount) || 0,
            comments: r.comments || [],
          };
        }
      }
    } catch (e) {}
    return reelsStore.find((r) => r.id === id || String(r.reelId) === String(id));
  },

  findBySeries: async (seriesName) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const list = await MongoReel.find({ seriesName, isPublished: true }).sort({ seriesPart: 1 }).lean();
        if (list && list.length > 0) {
          return list.map((r) => ({ ...r, id: r.reelId || r._id.toString() }));
        }
      }
    } catch (e) {}
    return reelsStore.filter((r) => r.seriesName === seriesName);
  },

  create: async (data) => {
    const reelId = data.id || data.reelId || `reel-${Date.now()}`;
    const newReel = {
      id: reelId,
      reelId: reelId,
      title: data.title,
      description: data.description || "Daily astrological guidance & Vedic insights.",
      astrologerName: data.astrologerName || "AstroAI Creator",
      astrologerTitle: data.astrologerTitle || "Vedic Astrologer",
      astrologerAvatar:
        data.astrologerAvatar ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      videoUrl: data.videoUrl || "",
      views: 0,
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      tag: data.tag ? (data.tag.startsWith("#") ? data.tag : `#${data.tag}`) : "#DailyUpay",
      seriesName: data.seriesName ? data.seriesName.trim() : "",
      seriesPart: data.seriesPart ? Number(data.seriesPart) || 1 : null,
      dateAdded: data.dateAdded || "Today",
      isPublished: true,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    };

    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongoReel.create(newReel);
        newReel._id = doc._id;
      }
    } catch (e) {
      console.warn("⚠️ [Reel Model] Atlas insert fallback:", e.message);
    }

    reelsStore.unshift(newReel);
    saveData("reels.json", reelsStore);
    return newReel;
  },

  updateById: async (id, updateData) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongoReel.findOneAndUpdate(
          { $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { $set: updateData },
          { new: true }
        ).lean();
        if (doc) return { ...doc, id: doc.reelId || doc._id.toString() };
      }
    } catch (e) {}

    const idx = reelsStore.findIndex((r) => r.id === id || String(r.reelId) === String(id));
    if (idx !== -1) {
      reelsStore[idx] = { ...reelsStore[idx], ...updateData };
      saveData("reels.json", reelsStore);
      return reelsStore[idx];
    }
    return null;
  },

  deleteById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        await MongoReel.deleteOne({
          $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
        });
      }
    } catch (e) {}

    const initialLen = reelsStore.length;
    reelsStore = reelsStore.filter((r) => r.id !== id && String(r.reelId) !== String(id));
    const deleted = reelsStore.length !== initialLen;
    if (deleted) saveData("reels.json", reelsStore);
    return deleted;
  },

  deleteBySeries: async (seriesName) => {
    try {
      if (mongoose.connection.readyState === 1) {
        await MongoReel.deleteMany({ seriesName });
      }
    } catch (e) {}

    const initialLen = reelsStore.length;
    reelsStore = reelsStore.filter((r) => r.seriesName !== seriesName);
    const deleted = reelsStore.length !== initialLen;
    if (deleted) saveData("reels.json", reelsStore);
    return deleted;
  },

  clearAll: async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await MongoReel.deleteMany({});
      }
    } catch (e) {}
    reelsStore = [];
    saveData("reels.json", reelsStore);
    return true;
  },

  // Real-Time View Count Increment (Atomic)
  trackView: async (id) => {
    let views = 0;
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongoReel.findOneAndUpdate(
          { $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { $inc: { views: 1 } },
          { new: true }
        );
        if (doc) views = doc.views;
      }
    } catch (e) {}

    const reel = reelsStore.find((r) => r.id === id || String(r.reelId) === String(id));
    if (reel) {
      reel.views = (reel.views || 0) + 1;
      saveData("reels.json", reelsStore);
      views = reel.views;
    }
    return { id, views };
  },

  // Real-Time Like / Unlike Toggle (Idempotent per user)
  toggleLike: async (id, userId = "guest") => {
    let likes = 0;
    let liked = false;

    try {
      if (mongoose.connection.readyState === 1) {
        const current = await MongoReel.findOne({
          $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
        });

        if (current) {
          const userHasLiked = Array.isArray(current.likedBy) && current.likedBy.includes(userId);
          let updateOp;

          if (userHasLiked && userId !== "guest") {
            // Unlike
            updateOp = { $inc: { likes: -1 }, $pull: { likedBy: userId } };
            liked = false;
          } else {
            // Like
            updateOp = { $inc: { likes: 1 }, ...(userId !== "guest" ? { $addToSet: { likedBy: userId } } : {}) };
            liked = true;
          }

          const doc = await MongoReel.findOneAndUpdate(
            { _id: current._id },
            updateOp,
            { new: true }
          );
          if (doc) {
            likes = Math.max(0, doc.likes);
          }
        }
      }
    } catch (e) {
      console.warn("⚠️ [Reel Model] Like error:", e.message);
    }

    const reel = reelsStore.find((r) => r.id === id || String(r.reelId) === String(id));
    if (reel) {
      if (!liked && reel.likes > 0) {
        reel.likes -= 1;
      } else {
        reel.likes = (reel.likes || 0) + 1;
      }
      saveData("reels.json", reelsStore);
      likes = reel.likes;
    }

    return { id, likes, liked };
  },

  // Real-Time Share Count Increment
  trackShare: async (id) => {
    let sharesCount = 0;
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongoReel.findOneAndUpdate(
          { $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { $inc: { sharesCount: 1 } },
          { new: true }
        );
        if (doc) sharesCount = doc.sharesCount;
      }
    } catch (e) {}

    const reel = reelsStore.find((r) => r.id === id || String(r.reelId) === String(id));
    if (reel) {
      reel.sharesCount = (reel.sharesCount || 0) + 1;
      saveData("reels.json", reelsStore);
      sharesCount = reel.sharesCount;
    }
    return { id, sharesCount };
  },

  // Real-Time Comments
  getComments: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongoReel.findOne(
          { $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { comments: 1 }
        ).lean();
        if (doc && Array.isArray(doc.comments)) {
          return doc.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
    } catch (e) {}

    const reel = reelsStore.find((r) => r.id === id || String(r.reelId) === String(id));
    return (reel?.comments || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addComment: async (id, commentData) => {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      commentId: `comment-${Date.now()}`,
      userId: commentData.userId || "guest",
      userName: commentData.userName || "Seeker",
      userAvatar:
        commentData.userAvatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
      text: commentData.text.trim(),
      createdAt: new Date(),
    };

    let commentsCount = 0;

    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongoReel.findOneAndUpdate(
          { $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          {
            $push: { comments: { $each: [newComment], $position: 0 } },
            $inc: { commentsCount: 1 },
          },
          { new: true }
        );
        if (doc) commentsCount = doc.commentsCount;
      }
    } catch (e) {
      console.warn("⚠️ [Reel Model] Add comment error:", e.message);
    }

    const reel = reelsStore.find((r) => r.id === id || String(r.reelId) === String(id));
    if (reel) {
      if (!Array.isArray(reel.comments)) reel.comments = [];
      reel.comments.unshift(newComment);
      reel.commentsCount = (reel.commentsCount || 0) + 1;
      commentsCount = reel.commentsCount;
      saveData("reels.json", reelsStore);
    }

    return { comment: newComment, commentsCount };
  },

  deleteComment: async (id, commentId) => {
    let commentsCount = 0;
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongoReel.findOneAndUpdate(
          { $or: [{ reelId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          {
            $pull: { comments: { $or: [{ id: commentId }, { commentId: commentId }] } },
            $inc: { commentsCount: -1 },
          },
          { new: true }
        );
        if (doc) commentsCount = Math.max(0, doc.commentsCount);
      }
    } catch (e) {}

    const reel = reelsStore.find((r) => r.id === id || String(r.reelId) === String(id));
    if (reel && Array.isArray(reel.comments)) {
      reel.comments = reel.comments.filter((c) => c.id !== commentId && c.commentId !== commentId);
      reel.commentsCount = Math.max(0, (reel.commentsCount || 0) - 1);
      commentsCount = reel.commentsCount;
      saveData("reels.json", reelsStore);
    }

    return { success: true, commentsCount };
  },
};
