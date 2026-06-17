import crypto from 'crypto';
import QRCode from 'qrcode';


/**
 * QR Token generation and verification for branch check-in QR codes.
 * Permanent QR codes encode the PWA url with query parameters.
 */

/**
 * Generate a cryptographically secure random token for a branch.
 * The resulting token is stored as Branch.qrToken in the database.
 */
export function generateQrToken(branchId) {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify that a scanned QR token matches the stored token for a branch.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param scannedToken  - Token parsed from the QR scan
 * @param storedToken   - Branch.qrToken from the database
 */
export function verifyQrToken(scannedToken, storedToken) {
  try {
    const a = Buffer.from(scannedToken);
    const b = Buffer.from(storedToken);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

/**
 * Generate a QR code image as a base64-encoded PNG data URL.
 * Suitable for embedding in <img src="..."> tags or saving to disk.
 *
 * @param url - The PWA Check-In URL to encode
 * @returns Base64 PNG data URL string
 */
export async function generateQrImage(url) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    width: 512,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
  });
}

/**
 * Generate a QR code image as a PNG Buffer.
 * Suitable for saving to disk or streaming as a file download.
 *
 * @param url - The PWA Check-In URL to encode
 */
export async function generateQrBuffer(url) {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    width: 512,
    margin: 2,
  });
}

/**
 * Generate a redemption QR code for a CustomerReward.
 * The payload is simply the redemption code string.
 */
export async function generateRedemptionQrImage(redemptionCode) {
  return QRCode.toDataURL(redemptionCode, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#f8fafc',
    },
  });
}

