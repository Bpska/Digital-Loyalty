import { z } from 'zod';

/**
 * Typed, validated environment configuration.
 * Throws at startup if any required variable is missing or malformed.
 * Import this `env` object everywhere instead of using process.env directly.
 */
const envSchema = z.object({
  // ── Database ─────────────────────────────────────────────
  DATABASE_URL: z.string().url(),

  // ── JWT ──────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // ── OTP ──────────────────────────────────────────────────
  OTP_PROVIDER: z.enum(['msg91', 'twilio', 'stub']).default('stub'),
  OTP_API_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  MSG91_SENDER_ID: z.string().default('DLVAPP'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  // ── Razorpay ─────────────────────────────────────────────
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // ── Application ──────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  BACKEND_URL: z.string().url().default('http://localhost:4000'),

  // ── Loyalty Defaults ─────────────────────────────────────
  DEFAULT_CHECKIN_RADIUS_METERS: z.coerce.number().default(50),
  DEFAULT_CHECKIN_COOLDOWN_HOURS: z.coerce.number().default(4),
  DEFAULT_POINTS_PER_VISIT: z.coerce.number().default(10),

  // ── Storage ──────────────────────────────────────────────
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(5),

  // ── Rate Limiting ─────────────────────────────────────────
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(5),
  RATE_LIMIT_AUTH_WINDOW_MIN: z.coerce.number().default(15),
  RATE_LIMIT_OTP_MAX: z.coerce.number().default(3),
  RATE_LIMIT_OTP_WINDOW_MIN: z.coerce.number().default(10),
  RATE_LIMIT_CHECKIN_MAX: z.coerce.number().default(10),
  RATE_LIMIT_CHECKIN_WINDOW_MIN: z.coerce.number().default(1),

  // ── QR Token ─────────────────────────────────────────────
  QR_HMAC_SECRET: z.string().min(32).default('dev-qr-secret-change-in-production!!'),

  // ── Google OAuth ──────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── Logging ──────────────────────────────────────────────
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_DIR: z.string().default('./logs'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
 
