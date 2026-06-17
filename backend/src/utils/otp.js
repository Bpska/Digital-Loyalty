 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import crypto from 'crypto';
import argon2 from 'argon2';

/**
 * OTP generation, hashing, and verification utilities.
 *
 * - OTP is a 6-digit numeric code
 * - Stored as an argon2 hash (never plain text)
 * - Has a configurable TTL (default 10 minutes)
 * - Max 3 failed attempts before invalidation
 */

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

/**
 * Generate a cryptographically random 6-digit OTP string.
 */
export function generateOtp() {
  // Use crypto.randomInt for uniform distribution (avoids modulo bias)
  const otp = crypto.randomInt(0, 1000000);
  return otp.toString().padStart(OTP_LENGTH, '0');
}

/**
 * Hash an OTP using argon2id for secure storage.
 */
export async function hashOtp(otp) {
  return argon2.hash(otp, {
    type: argon2.argon2id,
    memoryCost: 2 ** 15, // 32 MB — lower than password hashing for speed
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verify a plain OTP against a stored argon2 hash.
 */
export async function verifyOtp(plain, hash) {
  try {
    return await argon2.verify(hash, plain);
  } catch (e) {
    return false;
  }
}

/**
 * Calculate the OTP expiry timestamp (now + TTL minutes).
 */
export function getOtpExpiry(ttlMinutes = OTP_TTL_MINUTES) {
  return new Date(Date.now() + ttlMinutes * 60 * 1000);
}

/**
 * Check if an OTP record has expired.
 */
export function isOtpExpired(expiresAt) {
  return new Date() > expiresAt;
}

/**
 * Format a phone number to E.164 format (India default +91).
 * Strips spaces, dashes, parentheses. Adds +91 if no country code.
 */
export function normalizePhone(phone) {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return cleaned;
}

// ── OTP Provider Adapters ─────────────────────────────────────







/**
 * Send OTP via the configured provider.
 * In 'stub' mode, logs to console — for development only.
 */
export async function sendOtpViaSms(
  phone,
  otp,
  provider
) {
  switch (provider) {
    case 'stub':
      console.log(`\n📱 [OTP STUB] Phone: ${phone}  OTP: ${otp}\n`);
      return { success: true, requestId: 'stub-' + Date.now() };

    case 'msg91':
      return sendViaMSG91(phone, otp);

    case 'twilio':
      return sendViaTwilio(phone, otp);
  }
}

async function sendViaMSG91(phone, otp) {
  const { OTP_API_KEY, MSG91_TEMPLATE_ID, MSG91_SENDER_ID } = process.env;
  if (!OTP_API_KEY || !MSG91_TEMPLATE_ID) {
    return { success: false, error: 'MSG91 credentials not configured' };
  }
  try {
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: OTP_API_KEY },
      body: JSON.stringify({
        template_id: MSG91_TEMPLATE_ID,
        mobile: phone.replace('+', ''),
        authkey: OTP_API_KEY,
        otp,
        sender: _nullishCoalesce(MSG91_SENDER_ID, () => ( 'DLVAPP')),
      }),
    });
    const data = (await response.json()) ;
    if (data.type === 'success') {
      return { success: true, requestId: data.request_id };
    }
    return { success: false, error: _nullishCoalesce(data.message, () => ( 'MSG91 error')) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function sendViaTwilio(phone, otp) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { success: false, error: 'Twilio credentials not configured' };
  }
  try {
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const body = new URLSearchParams({
      From: TWILIO_FROM_NUMBER,
      To: phone,
      Body: `Your DLV verification code is: ${otp}. Valid for 10 minutes.`,
    });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }
    );
    const data = (await response.json()) ;
    if (data.sid) return { success: true, requestId: data.sid };
    return { success: false, error: _nullishCoalesce(data.message, () => ( 'Twilio error')) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
