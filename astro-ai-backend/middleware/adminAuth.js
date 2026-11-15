// Master Admin Authentication & Security Guard (Cryptographic JWT + RBAC Enforcement)
import { requireAdmin } from "./auth.js";

// Export standard requireAdmin as verifyAdmin for backward compatibility across routes
export const verifyAdmin = requireAdmin;

export default verifyAdmin;
