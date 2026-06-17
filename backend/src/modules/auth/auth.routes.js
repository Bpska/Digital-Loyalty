import { Router } from 'express';
import * as controller from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authRateLimiter, otpRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
  sendOtpSchema,
  verifyOtpSchema,
  passwordLoginSchema,
  registerSchema,
  googleLoginSchema,
  registerBusinessSchema,
} from './auth.validator.js';

const router = Router();

// ── Customer Auth ─────────────────────────────────────────────
router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/google', authRateLimiter, validate(googleLoginSchema), controller.googleLogin);

// ── Business Auth ─────────────────────────────────────────────
router.post('/register-business', authRateLimiter, validate(registerBusinessSchema), controller.registerBusiness);

// ── Customer OTP flow (Optional fallback / legacy) ─────────────
router.post('/otp/send', otpRateLimiter, validate(sendOtpSchema), controller.sendOtp);
router.post('/otp/verify', otpRateLimiter, validate(verifyOtpSchema), controller.verifyOtp);

// ── Password login (Everyone — Customer, Staff, Admins) ───────
router.post('/login', authRateLimiter, validate(passwordLoginSchema), controller.login);

// ── Token management ──────────────────────────────────────────
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logoutHandler);

// ── Authenticated user info ───────────────────────────────────
router.get('/me', authenticate, controller.getMe);

export default router;
