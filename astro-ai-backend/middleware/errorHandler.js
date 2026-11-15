// Hardened Global Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  // Safe sanitized logging without passwords or tokens
  const safePath = req.originalUrl || req.url;
  const safeMethod = req.method;
  console.error(`💥 [Server Error] ${safeMethod} ${safePath}:`, err.message || "Unknown error");

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  
  // Safe user-facing message
  let message = err.message || "An unexpected internal server error occurred.";
  
  // Clean up MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    message = "A resource with that unique identifier already exists.";
  }

  // Ensure internal stack traces are never exposed in production
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    code: err.code || "INTERNAL_ERROR",
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
