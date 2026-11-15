// Comprehensive Automated Security Verification Suite (Non-Destructive)
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  securityConfig,
  generateUserToken,
  generateAdminToken,
  verifyJwtToken,
  revokeToken,
  JWT_EXPIRY_SECONDS,
  hashPassword,
  comparePassword,
} from "./config/security.js";
import { UserModel, sanitizeUser } from "./models/User.js";

async function runSecurityAuditTests() {
  console.log("=========================================================");
  console.log("🛡️ STARTING AUTOMATED SECURITY VERIFICATION TESTS");
  console.log("=========================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. JWT Expiration & Verification
  console.log("--- TEST GROUP 1: JWT AUTHENTICATION & EXPIRATION ---");
  const testUser = {
    userId: "test_u_99",
    email: "security_test@uurja.in",
    role: "user",
  };
  const token = generateUserToken(testUser);
  const decoded = verifyJwtToken(token);

  assert(decoded.exp - decoded.iat === 3600, "1.1 JWT expires in exactly 3600 seconds (1 hour)");
  assert(decoded.iss === "astro-ai-backend", "1.2 JWT issuer is validated ('astro-ai-backend')");
  assert(decoded.aud === "astro-ai-app", "1.3 JWT audience is validated ('astro-ai-app')");
  assert(decoded.role === "user", "1.4 User role is correctly embedded in JWT claims");

  // Expired token test
  try {
    const expiredToken = jwt.sign(
      { userId: "test", role: "user" },
      securityConfig.jwtSecret,
      {
        algorithm: "HS256",
        expiresIn: -10, // already expired
        issuer: securityConfig.issuer,
        audience: securityConfig.audience,
      }
    );
    verifyJwtToken(expiredToken);
    assert(false, "1.5 Expired JWT must be rejected (unexpected pass)");
  } catch (err) {
    assert(err.name === "TokenExpiredError", "1.5 Expired token is rejected with TokenExpiredError");
  }

  // Tampered token test
  try {
    const tampered = token.slice(0, -6) + "xxxxxx";
    verifyJwtToken(tampered);
    assert(false, "1.6 Tampered JWT must be rejected (unexpected pass)");
  } catch (err) {
    assert(err.name === "JsonWebTokenError", "1.6 Tampered token is rejected with JsonWebTokenError");
  }

  // Revoked token test
  revokeToken(token);
  try {
    verifyJwtToken(token);
    assert(false, "1.7 Revoked token must be rejected (unexpected pass)");
  } catch (err) {
    assert(err.name === "TokenRevokedError", "1.7 Revoked token is rejected upon logout");
  }

  // 2. Admin RBAC & Master Token
  console.log("\n--- TEST GROUP 2: ADMIN RBAC & TOKEN GENERATION ---");
  const adminToken = generateAdminToken("master_admin");
  const decodedAdmin = verifyJwtToken(adminToken);
  assert(decodedAdmin.role === "admin", "2.1 Admin token has role 'admin'");
  assert(decodedAdmin.exp - decodedAdmin.iat === 3600, "2.2 Admin token expires in exactly 3600 seconds");

  // Normal user token cannot act as admin
  const normalUserToken = generateUserToken({ userId: "u-normal", role: "user" });
  const decodedNormal = verifyJwtToken(normalUserToken);
  assert(decodedNormal.role !== "admin", "2.3 Normal user token cannot claim admin role");

  // 3. Password Hashing & Bcrypt Verification
  console.log("\n--- TEST GROUP 3: PASSWORD HASHING (BCRYPT) ---");
  const plainPass = "AstroSecureP@ss2026!";
  const hash = await hashPassword(plainPass);
  assert(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "3.1 Password hashed using bcrypt");
  assert(hash !== plainPass, "3.2 Plaintext password is never stored or returned");
  assert(await comparePassword(plainPass, hash), "3.3 Correct password matches hash");
  assert(!(await comparePassword("WrongPassword123", hash)), "3.4 Incorrect password rejected");

  // 4. Data Sanitization (Zero Password Leakage)
  console.log("\n--- TEST GROUP 4: PII & PASSWORD LEAKAGE PREVENTION ---");
  const rawUserWithSecret = {
    userId: "u-test-99",
    name: "Test Seeker",
    email: "seeker@uurja.in",
    password: hash,
    __v: 0,
    walletBalance: 100,
  };
  const sanitized = sanitizeUser(rawUserWithSecret);
  assert(sanitized.password === undefined, "4.1 Password is completely stripped from user response");
  assert(sanitized.__v === undefined, "4.2 Internal version metadata stripped");
  assert(sanitized.email === "seeker@uurja.in", "4.3 Public user fields preserved");

  console.log("\n=========================================================");
  console.log(`🎯 RESULTS: ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("=========================================================\n");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
