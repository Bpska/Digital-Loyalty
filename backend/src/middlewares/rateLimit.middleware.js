 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';


const rateLimitHandler = (req, res) => {
  sendError(res, 'Too many requests. Please try again later.', 429);
};

/**
 * General auth rate limiter (login, password reset).
 * 15 requests per 15 minutes per real client IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MIN * 60 * 1000,
  max: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  // Extract real client IP behind Nginx/Docker proxy layers
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return String(forwarded).split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
});

/**
 * OTP-specific rate limiter — stricter.
 * 3 OTP requests per 10 minutes per IP.
 */
export const otpRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_OTP_WINDOW_MIN * 60 * 1000,
  max: env.RATE_LIMIT_OTP_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Key by IP + phone number for more granular limiting
  keyGenerator: (req) => {
    const phone = _nullishCoalesce(_optionalChain([req, 'access', _ => _.body, 'optionalAccess', _2 => _2.phone]), () => ( 'unknown'));
    return `${req.ip}-${phone}`;
  },
  skip: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
});

/**
 * Check-in rate limiter.
 * 10 check-in requests per 1 minute per IP.
 */
export const checkinRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_CHECKIN_WINDOW_MIN * 60 * 1000,
  max: env.RATE_LIMIT_CHECKIN_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
});

/**
 * Global API rate limiter — broad protection for all routes.
 * 200 requests per minute per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
});
