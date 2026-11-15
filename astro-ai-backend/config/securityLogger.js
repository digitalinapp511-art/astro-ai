// Structured Security Event Logger for Production Incident Detection & Auditing
export const logSecurityEvent = (eventType, details = {}) => {
  const sanitizedDetails = { ...details };

  // Explicitly redact sensitive credentials and personal identifiers
  delete sanitizedDetails.password;
  delete sanitizedDetails.token;
  delete sanitizedDetails.pin;
  delete sanitizedDetails.jwtSecret;
  delete sanitizedDetails.key_secret;
  delete sanitizedDetails.secret;
  delete sanitizedDetails.authHeader;

  const eventPayload = {
    timestamp: new Date().toISOString(),
    level: "SECURITY_AUDIT",
    eventType,
    ...sanitizedDetails,
  };

  console.log(`🛡️ [SEC-AUDIT] ${JSON.stringify(eventPayload)}`);
};
