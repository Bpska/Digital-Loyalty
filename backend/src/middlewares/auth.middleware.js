 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { Responses } from '../utils/response.js';
import { AppError } from './error.middleware.js';

/**
 * Shape of the JWT access token payload.
 */




















// ── JWT helpers ───────────────────────────────────────────────

/**
 * Authenticate middleware — verifies JWT from httpOnly cookie or Authorization header.
 * Attaches decoded payload to req.user.
 */
export function authenticate(req, res, next) {
  try {
    // Prefer httpOnly cookie; fall back to Bearer header (for API clients / Swagger)
    const cookieToken = _optionalChain([req, 'access', _ => _.cookies, 'optionalAccess', _2 => _2.accessToken]) ;
    const bearerToken = _optionalChain([req, 'access', _3 => _3.headers, 'access', _4 => _4.authorization, 'optionalAccess', _5 => _5.startsWith, 'call', _6 => _6('Bearer ')])
      ? req.headers.authorization.slice(7)
      : undefined;
    const token = _nullishCoalesce(cookieToken, () => ( bearerToken));

    if (!token) {
      Responses.unauthorized(res, 'No access token provided');
      return;
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) ;
    req.user = payload;

    // Validate Origin header to mitigate CSRF (SameSite=Strict + Origin check)
    const origin = req.headers.origin;
    if (origin && !isAllowedOrigin(origin)) {
      Responses.forbidden(res, 'Cross-origin request not allowed');
      return;
    }

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      Responses.unauthorized(res, 'Access token expired');
    } else if (err instanceof jwt.JsonWebTokenError) {
      Responses.unauthorized(res, 'Invalid access token');
    } else {
      next(err);
    }
  }
}

/**
 * RBAC guard — restricts access to specific roles.
 * Must be used AFTER `authenticate`.
 *
 * @param roles - One or more allowed roles
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      Responses.unauthorized(res);
      return;
    }
    if (!roles.includes(req.user.role)) {
      Responses.forbidden(res, `Access denied. Required role(s): ${roles.join(', ')}`);
      return;
    }
    next();
  };
}

/**
 * Business tenant guard — ensures the authenticated user's businessId
 * matches the :businessId route param.
 * SUPER_ADMIN bypasses this check.
 */
export function requireSameBusiness(
  req,
  res,
  next
) {
  if (!req.user) {
    Responses.unauthorized(res);
    return;
  }
  if (req.user.role === Role.SUPER_ADMIN) {
    next();
    return;
  }
  const { businessId } = req.params;
  if (req.user.businessId !== businessId) {
    Responses.forbidden(res, 'Access denied: not your business');
    return;
  }
  next();
}

// ── Token generation ──────────────────────────────────────────








/**
 * Issue a short-lived access token (default 15m).
 */
export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      businessId: user.businessId,
      branchId: user.branchId,
    },
    env.JWT_ACCESS_SECRET ,
    { expiresIn: env.JWT_ACCESS_EXPIRY  }
  );
}

/**
 * Issue a long-lived refresh token (default 7d).
 */
export function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET ,
    {
      expiresIn: env.JWT_REFRESH_EXPIRY ,
    }
  );
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) ;
  } catch (e) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
}

/**
 * Set access + refresh tokens as httpOnly, SameSite=Strict cookies.
 */
export function setTokenCookies(
  res,
  accessToken,
  refreshToken
) {
  const isProd = env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh',     // Restrict to refresh endpoint only
  });
}

/**
 * Clear auth cookies on logout.
 */
export function clearTokenCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
}

// ── Origin validation ─────────────────────────────────────────

function isAllowedOrigin(origin) {
  const allowed = [env.FRONTEND_URL, env.BACKEND_URL];
  // Allow localhost variations in development
  if (env.NODE_ENV !== 'production') {
    allowed.push(
      'http://localhost:3000',
      'http://localhost:4000',
      'http://127.0.0.1:3000',
      'http://localhost:3004',
      'http://127.0.0.1:3004'
    );
  }

  const isAllowedPattern = origin && (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.includes('72.61.169.195') ||
    origin.includes('frunko.in')
  );

  return allowed.some(a => origin.startsWith(a)) || isAllowedPattern;
}
