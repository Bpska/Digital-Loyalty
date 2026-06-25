 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import * as authService from './auth.service.js';
import { sendSuccess, sendCreated, Responses } from '../../utils/response.js';
import { setTokenCookies, clearTokenCookies } from '../../middlewares/auth.middleware.js';
import { getClientIp } from '../../utils/ip.js';

// ─────────────────────────────────────────────────────────────
// Customer OTP Auth
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/otp/send:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to customer phone
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
export async function sendOtp(req, res, next) {
  try {
    const result = await authService.sendCustomerOtp(req.body);
    sendSuccess(res, result, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and issue tokens (registers customer on first call)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otp]
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *               name:
 *                 type: string
 *                 description: Required for first-time registration
 *               deviceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Authentication successful
 */
export async function verifyOtp(req, res, next) {
  try {
    const ip = getClientIp(req);
    const result = await authService.verifyCustomerOtp(req.body, ip);
    setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 */
export async function register(req, res, next) {
  try {
    const ip = getClientIp(req);
    const result = await authService.registerCustomer(req.body, ip);
    setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    sendCreated(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Registration successful');
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /auth/register-business:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new business (pending admin approval)
 *     security: []
 */
export async function registerBusiness(req, res, next) {
  try {
    const ip = getClientIp(req);
    const result = await authService.registerBusiness(req.body, ip);
    setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    sendCreated(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Registration successful');
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate customer via Google ID Token
 *     security: []
 */
export async function googleLogin(req, res, next) {
  try {
    const ip = getClientIp(req);
    const result = await authService.loginWithGoogle(req.body, ip);
    if (result.newUser) {
      sendSuccess(res, { newUser: true, email: result.email, name: result.name }, 'Google registration required');
      return;
    }
    setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// Password Auth (Everyone)
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Password login for Staff, Business Admin, and Super Admin
 *     security: []
 */
export async function login(req, res, next) {
  try {
    const ip = getClientIp(req);
    const result = await authService.passwordLogin(req.body, ip);
    setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// Token Refresh
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token and issue new access token
 *     security: []
 */
export async function refresh(req, res, next) {
  try {
    // Prefer httpOnly cookie; allow body fallback for API clients
    const rawToken = _nullishCoalesce(_optionalChain([req, 'access', _ => _.cookies, 'optionalAccess', _2 => _2.refreshToken]), () => ( _optionalChain([req, 'access', _3 => _3.body, 'optionalAccess', _4 => _4.refreshToken])));
    if (!rawToken) {
      Responses.unauthorized(res, 'No refresh token provided');
      return;
    }
    const ip = getClientIp(req);
    const tokens = await authService.refreshTokens(rawToken, ip);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke refresh token and clear cookies
 */
export async function logoutHandler(
  req,
  res,
  next
) {
  try {
    const rawToken = _nullishCoalesce(_optionalChain([req, 'access', _5 => _5.cookies, 'optionalAccess', _6 => _6.refreshToken]), () => ( _optionalChain([req, 'access', _7 => _7.body, 'optionalAccess', _8 => _8.refreshToken])));
    if (rawToken) {
      await authService.logout(rawToken);
    }
    clearTokenCookies(res);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// Current User
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get authenticated user profile
 */
export async function getMe(req, res, next) {
  try {
    const profile = await authService.getMeProfile(req.user.sub);
    sendSuccess(res, profile, 'Current user');
  } catch (err) {
    next(err);
  }
}

// Central helper getClientIp is imported from utils/ip.js
