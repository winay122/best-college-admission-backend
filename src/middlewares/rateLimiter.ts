import rateLimit from 'express-rate-limit';

// Global API Rate Limiter
// Limits each IP address to 100 requests per 15-minute window to prevent brute-force or DDoS attacks.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max requests allowed per IP
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
