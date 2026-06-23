import { z } from 'zod';

/**
 * Shared phone validator — India format, E.164 normalized.
 */
const phoneSchema = z
  .string()
  .min(10)
  .max(15)
  .regex(/^[+\d\s\-().]+$/, 'Invalid phone format');

// ── Customer OTP Auth ─────────────────────────────────────────

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6).regex(/^\d+$/, 'OTP must be 6 digits'),
  name: z.string().min(2).max(100).optional(), // Required on first login (registration)
  deviceId: z.string().uuid().optional(),
});

// ── Staff / Admin / Customer Password Auth ────────────────────

export const passwordLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6).max(128),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email format'),
  phone: phoneSchema,
  password: z.string().min(8).max(128),
});

export const refreshTokenSchema = z.object({
  // Can come from cookie (preferred) or body
  refreshToken: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a digit'
      ),
    confirmPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const googleLoginSchema = z.object({
  idToken: z.string(),
  phone: phoneSchema.optional(),
});

export const registerBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email format'),
  phone: phoneSchema,
  password: z.string().min(8).max(128),
  businessName: z.string().min(2).max(100),
  address: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(2).max(200).optional()
  ),
  category: z.string().optional().nullable(),
  bookingUrl: z.string().optional().nullable(),
});

 






