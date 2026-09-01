const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

// Tighter limiter for auth endpoints - mitigates credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMin * 60 * 1000,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

// Looser general-purpose limiter for the rest of the API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
