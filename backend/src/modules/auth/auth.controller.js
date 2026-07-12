import * as authService from './auth.service.js';
import { sendSuccess, sendCreated, Responses } from '../../utils/response.js';
import { setTokenCookies, clearTokenCookies } from '../../middlewares/auth.middleware.js';
import { getClientIp } from '../../utils/ip.js';
import prisma from '../../config/prisma.js';

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
    if (result.requiresVerification) {
      sendCreated(res, { requiresVerification: true, userId: result.userId, email: result.email }, 'Registration successful. Verification code sent.');
      return;
    }
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
    if (result.requiresVerification) {
      sendCreated(res, { requiresVerification: true, userId: result.userId, email: result.email }, 'Registration successful. Verification code sent.');
      return;
    }
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
    const rawToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
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
    const rawToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
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

export async function updateProfile(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.sub;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, id: { not: userId } }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use by another account' });
      }
    }

    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone, id: { not: userId } }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Phone number is already in use by another account' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
      select: { id: true, name: true, phone: true, email: true }
    });

    sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function sendEmailOtpHandler(req, res, next) {
  try {
    const result = await authService.sendEmailOtp(req.body.userId);
    sendSuccess(res, result, 'Verification email sent successfully');
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailOtpHandler(req, res, next) {
  try {
    const ip = getClientIp(req);
    const result = await authService.verifyEmailOtp(req.body.userId, req.body.otp, ip);
    setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Email verified successfully');
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordHandler(req, res, next) {
  try {
    const result = await authService.sendForgotPasswordOtp(req.body.email);
    sendSuccess(res, result, 'Password reset email sent successfully');
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
    sendSuccess(res, result, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
}

// Central helper getClientIp is imported from utils/ip.js

