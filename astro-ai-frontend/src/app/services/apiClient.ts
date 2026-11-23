/**
 * AstroAI — Centralized Frontend API Service Client
 * Connects frontend views and components directly to the Node.js MVC backend.
 */

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://astro-ai-x5c6.onrender.com/api/v1";
};

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://astro-ai-x5c6.onrender.com/api/v1";

// Generic request helper with fast timeout, auto-JWT attachment, and safe error handling
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const baseUrl = getBaseUrl();
    
    // Auto-attach JWT Authorization token if present in secure storage
    let token: string | null = null;
    if (typeof window !== "undefined") {
      const isAdminRoute =
        endpoint.startsWith("/admin") ||
        endpoint.startsWith("/poojas/appointments") ||
        (endpoint.startsWith("/users") && (endpoint.includes("/bonus") || endpoint.includes("/ban") || endpoint === "/users"));

      if (isAdminRoute) {
        token =
          sessionStorage.getItem("astroai_admin_token") ||
          localStorage.getItem("astroai_admin_token") ||
          localStorage.getItem("astroai_auth_token");
      } else {
        token =
          localStorage.getItem("astroai_auth_token") ||
          sessionStorage.getItem("astroai_auth_token") ||
          sessionStorage.getItem("astroai_admin_token");
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      signal: options.signal || controller.signal,
      headers,
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      console.warn(`[API] 401 Unauthorized on ${endpoint}`);
      if (typeof window !== "undefined" && endpoint.startsWith("/admin")) {
        sessionStorage.removeItem("astroai_admin_token");
        localStorage.removeItem("astroai_admin_token");
      }
      return null;
    }

    if (!res.ok) {
      console.warn(`[API] Error ${res.status} on ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.warn(`[API] Timeout after 8s on ${endpoint} (Server waking up)`);
    } else {
      console.warn(`[API] Network error on ${endpoint}:`, err);
    }
    return null;
  }
}

// 1. Astrologers API
export const astrologersApi = {
  getAll: async () => {
    const data = await apiRequest<{ success: boolean; astrologers: any[] }>("/astrologers");
    return data?.astrologers || null;
  },
  create: async (astroData: any) => {
    return await apiRequest<{ success: boolean; astrologer: any }>("/astrologers", {
      method: "POST",
      body: JSON.stringify(astroData),
    });
  },
  update: async (id: string, astroData: any) => {
    return await apiRequest<{ success: boolean; message: string; astrologer: any }>(`/astrologers/${id}`, {
      method: "PUT",
      body: JSON.stringify(astroData),
    });
  },
  delete: async (id: string) => {
    return await apiRequest<{ success: boolean; message: string }>(`/astrologers/${id}`, {
      method: "DELETE",
    });
  },
  toggleStatus: async (id: string, isOnline: boolean) => {
    return await apiRequest<{ success: boolean; astrologer: any }>(`/astrologers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isOnline }),
    });
  },
};

// 2. AI Astrologer API
export const aiApi = {
  chat: async (message: string, context?: any) => {
    return await apiRequest<{
      success: boolean;
      reply: string;
      remedy?: string;
      mantra?: string;
    }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    });
  },
};

// 3. Subscriptions & ₹4 Auto-Debit Mandate API (Official Razorpay Integration)
export const subscriptionsApi = {
  getConfig: async () => {
    const data = await apiRequest<{ success: boolean; config: any; razorpayKeyId?: string }>("/subscriptions/config");
    if (!data?.config) return null;
    return {
      ...data.config,
      razorpayKeyId: data.razorpayKeyId,
    };
  },
  updateConfig: async (config: any) => {
    return await apiRequest<{ success: boolean; config: any }>("/subscriptions/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  },
  createMandate: async (upiApp: string = "razorpay", userId?: string, amount?: number) => {
    return await apiRequest<{ 
      success: boolean; 
      keyId?: string;
      razorpayOrderId?: string;
      order?: any; 
      mandate: any 
    }>("/subscriptions/create-mandate", {
      method: "POST",
      body: JSON.stringify({ upiApp, userId, amount }),
    });
  },
  verifyMandate: async (payload: {
    mandateId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    upiApp?: string;
    userId?: string;
    userName?: string;
  } | string, upiAppArg?: string, userIdArg?: string) => {
    // Support both object payload and legacy arguments
    const bodyObj = typeof payload === "string" 
      ? { mandateId: payload, upiApp: upiAppArg, userId: userIdArg }
      : payload;

    return await apiRequest<{ success: boolean; subscription: any; message?: string }>("/subscriptions/verify-mandate", {
      method: "POST",
      body: JSON.stringify(bodyObj),
    });
  },
  cancelMandate: async (mandateId: string) => {
    return await apiRequest<{ success: boolean; message: string }>("/subscriptions/cancel-mandate", {
      method: "POST",
      body: JSON.stringify({ mandateId }),
    });
  },
};

// 4. Reels Short Videos API
export const reelsApi = {
  getAll: async () => {
    const data = await apiRequest<{ success: boolean; reels: any[] }>("/reels");
    return data?.reels || null;
  },
  publish: async (reelData: any) => {
    return await apiRequest<{ success: boolean; reel: any }>("/reels", {
      method: "POST",
      body: JSON.stringify(reelData),
    });
  },
  delete: async (id: string) => {
    return await apiRequest<{ success: boolean; message: string }>(`/reels/${id}`, {
      method: "DELETE",
    });
  },
  deleteSeries: async (seriesName: string) => {
    return await apiRequest<{ success: boolean; message: string }>(`/reels/series/${encodeURIComponent(seriesName)}`, {
      method: "DELETE",
    });
  },
  like: async (id: string, userId?: string) => {
    return await apiRequest<{ success: boolean; likes: number; liked: boolean }>(`/reels/${id}/like`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },
  toggleLike: async (id: string, userId?: string) => {
    return await apiRequest<{ success: boolean; likes: number; liked: boolean }>(`/reels/${id}/like`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },
  trackView: async (id: string) => {
    return await apiRequest<{ success: boolean; views: number }>(`/reels/${id}/view`, {
      method: "POST",
    });
  },
  trackShare: async (id: string) => {
    return await apiRequest<{ success: boolean; sharesCount: number }>(`/reels/${id}/share`, {
      method: "POST",
    });
  },
  getComments: async (id: string) => {
    const data = await apiRequest<{ success: boolean; comments: any[] }>(`/reels/${id}/comments`);
    return data?.comments || [];
  },
  addComment: async (id: string, commentData: { text: string; userName?: string; userAvatar?: string; userId?: string }) => {
    return await apiRequest<{ success: boolean; comment: any; commentsCount: number }>(`/reels/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  },
  deleteComment: async (id: string, commentId: string) => {
    return await apiRequest<{ success: boolean; message: string; commentsCount: number }>(`/reels/${id}/comments/${commentId}`, {
      method: "DELETE",
    });
  },
  uploadVideo: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("video", file);

      const token =
        sessionStorage.getItem("astroai_admin_token") ||
        localStorage.getItem("astroai_admin_token") ||
        localStorage.getItem("astroai_auth_token");

      const res = await fetch(`${getBaseUrl()}/reels/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      return await res.json();
    } catch (err) {
      console.warn("[API] Video upload error:", err);
      return { success: false, message: "Upload failed" };
    }
  },
};

// 5. App Users API (Secured with 1-Hour JWT Auth)
export const usersApi = {
  getAll: async () => {
    const data = await apiRequest<{ success: boolean; users: any[] }>("/users");
    return data?.users || null;
  },
  login: async (email: string, password?: string) => {
    const res = await apiRequest<{
      success: boolean;
      user?: any;
      token?: string;
      expiresIn?: number;
      message?: string;
      code?: string;
    }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res?.success && res?.token && typeof window !== "undefined") {
      localStorage.setItem("astroai_auth_token", res.token);
      if (res.user) {
        localStorage.setItem("astroai_auth_user", JSON.stringify(res.user));
        window.dispatchEvent(new Event("astroai_user_updated"));
      }
    }
    return res;
  },
  signup: async (name: string, email: string, password?: string) => {
    const res = await apiRequest<{
      success: boolean;
      user?: any;
      token?: string;
      expiresIn?: number;
      message?: string;
      code?: string;
    }>("/users/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (res?.success && res?.token && typeof window !== "undefined") {
      localStorage.setItem("astroai_auth_token", res.token);
      if (res.user) {
        localStorage.setItem("astroai_auth_user", JSON.stringify(res.user));
        window.dispatchEvent(new Event("astroai_user_updated"));
      }
    }
    return res;
  },
  logout: async (token?: string) => {
    try {
      const activeToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("astroai_auth_token") || sessionStorage.getItem("astroai_auth_token")
          : null);

      await apiRequest<{ success: boolean; message: string }>("/users/logout", {
        method: "POST",
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
      });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("astroai_auth_token");
        localStorage.removeItem("astroai_auth_user");
        sessionStorage.removeItem("astroai_auth_token");
        sessionStorage.removeItem("astroai_session_token");
        sessionStorage.removeItem("astroai_session_user");
        window.dispatchEvent(new Event("astroai_user_updated"));
      }
    }
  },
  verifySession: async () => {
    return await apiRequest<{ success: boolean; user?: any }>("/users/verify-session");
  },
  addBonus: async (id: string, amount: number) => {
    return await apiRequest<{ success: boolean; walletBalance: number }>(`/users/${id}/bonus`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },
  toggleBan: async (id: string) => {
    return await apiRequest<{ success: boolean; isBanned: boolean }>(`/users/${id}/ban`, {
      method: "PUT",
    });
  },
};

// 6. Master Admin API (RBAC & Admin JWT Token Management)
export const adminApi = {
  getAnalytics: async () => {
    const data = await apiRequest<{ success: boolean; metrics: any }>("/admin/analytics");
    return data?.metrics || null;
  },
  getAIBots: async () => {
    const data = await apiRequest<{ success: boolean; aiPersonas: any[] }>("/admin/ai-bots");
    return data?.aiPersonas || null;
  },
  addAIBot: async (botData: any) => {
    return await apiRequest<{ success: boolean; bot: any }>("/admin/ai-bots", {
      method: "POST",
      body: JSON.stringify(botData),
    });
  },
  deleteAIBot: async (id: string) => {
    return await apiRequest<{ success: boolean; message: string }>(`/admin/ai-bots/${id}`, {
      method: "DELETE",
    });
  },
  broadcast: async (title: string, body: string) => {
    return await apiRequest<{ success: boolean; message: string }>("/admin/broadcast", {
      method: "POST",
      body: JSON.stringify({ title, body }),
    });
  },
  wipeData: async () => {
    return await apiRequest<{ success: boolean; message: string }>("/admin/wipe-data", {
      method: "POST",
    });
  },
  login: async (pin: string) => {
    const res = await apiRequest<{ success: boolean; token: string; expiresIn?: number; message: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });

    if (res?.success && res.token && typeof window !== "undefined") {
      sessionStorage.setItem("astroai_admin_token", res.token);
      localStorage.setItem("astroai_admin_token", res.token);
    }
    return res;
  },
  logout: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("astroai_admin_token");
      localStorage.removeItem("astroai_admin_token");
    }
  },
  changePin: async (currentPin: string, newPin: string) => {
    return await apiRequest<{ success: boolean; message: string; newPin?: string }>("/admin/change-pin", {
      method: "POST",
      body: JSON.stringify({ currentPin, newPin }),
    });
  },
};

// Convenient alias for AI Bot management
export const aiBotsApi = {
  getAll: adminApi.getAIBots,
  create: adminApi.addAIBot,
  delete: adminApi.deleteAIBot,
};

// 7. Hero Banners & Slider API
export interface BannerItem {
  id: string;
  bannerId: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl?: string;
  type?: string;
  bgGradient?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  isActive?: boolean;
  isSystemDefault?: boolean;
}

export const bannersApi = {
  getAll: async () => {
    const data = await apiRequest<{ success: boolean; banners: BannerItem[] }>("/banners");
    return data?.banners || null;
  },
  create: async (bannerData: Partial<BannerItem>) => {
    return await apiRequest<{ success: boolean; banner: BannerItem; message: string }>("/banners", {
      method: "POST",
      body: JSON.stringify(bannerData),
    });
  },
  toggleStatus: async (id: string, isActive: boolean) => {
    return await apiRequest<{ success: boolean; banner: BannerItem }>(`/banners/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },
  delete: async (id: string) => {
    return await apiRequest<{ success: boolean; message: string }>(`/banners/${id}`, {
      method: "DELETE",
    });
  },
};

// 8. Vedic Poojas & Pandit Ji Appointments API
export interface PoojaItem {
  id: string;
  poojaId: string;
  name: string;
  subtitle: string;
  deity: string;
  category: string;
  duration: string;
  price: number;
  originalPrice?: number;
  purohitsCount?: string;
  badge?: string;
  panditName: string;
  image: string;
  benefits: string[];
  description: string;
  isActive: boolean;
}

export interface PoojaAppointmentItem {
  id: string;
  appointmentId: string;
  poojaId: string;
  poojaName: string;
  panditName: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  gotra: string;
  preferredDate: string;
  preferredTime: string;
  mode: string;
  price: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  notes?: string;
  createdAt: string;
}

export const poojasApi = {
  getAll: async () => {
    const data = await apiRequest<{ success: boolean; poojas: PoojaItem[] }>("/poojas");
    return data?.poojas || null;
  },
  create: async (poojaData: Partial<PoojaItem>) => {
    return await apiRequest<{ success: boolean; message: string; pooja: PoojaItem }>("/poojas", {
      method: "POST",
      body: JSON.stringify(poojaData),
    });
  },
  update: async (id: string, poojaData: Partial<PoojaItem>) => {
    return await apiRequest<{ success: boolean; message: string; pooja: PoojaItem }>(`/poojas/${id}`, {
      method: "PUT",
      body: JSON.stringify(poojaData),
    });
  },
  delete: async (id: string) => {
    return await apiRequest<{ success: boolean; message: string }>(`/poojas/${id}`, {
      method: "DELETE",
    });
  },
  book: async (appointmentData: any) => {
    return await apiRequest<{ success: boolean; message: string; appointment: PoojaAppointmentItem }>("/poojas/book", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
  },
  getAppointments: async () => {
    const data = await apiRequest<{ success: boolean; appointments: PoojaAppointmentItem[] }>("/poojas/appointments");
    return data?.appointments || null;
  },
  updateAppointmentStatus: async (id: string, status: string) => {
    return await apiRequest<{ success: boolean; message: string; appointment: PoojaAppointmentItem }>(
      `/poojas/appointments/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  },
  deleteAppointment: async (id: string) => {
    return await apiRequest<{ success: boolean; message: string }>(`/poojas/appointments/${id}`, {
      method: "DELETE",
    });
  },
};
