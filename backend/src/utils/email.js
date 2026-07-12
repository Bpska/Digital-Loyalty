import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// ── Nodemailer SMTP Transporter ────────────────────────────────
let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!env.SMTP_PASS) {
      logger.warn('SMTP_PASS not set — email sending will be stubbed (logged to console)');
      return null;
    }
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Bypass SSL certificate verification issues common on VPS
      },
    });
  }
  return transporter;
}

// ── Email Templates ────────────────────────────────────────────

function buildVerificationEmailHtml(otp) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF6A00,#FF8E3C);padding:32px 24px;text-align:center;">
              <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.5px;">ScanLoyal</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0 0;">Digital Loyalty Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="color:#0F172A;font-size:20px;font-weight:700;margin:0 0 8px 0;">Welcome to ScanLoyal 👋</h2>
              <p style="color:#64748B;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                Your verification code is:
              </p>
              <!-- OTP Code -->
              <div style="text-align:center;margin:0 0 24px 0;">
                <div style="display:inline-block;background:#FFF7ED;border:2px solid #FF6A00;border-radius:12px;padding:16px 32px;">
                  <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#FF6A00;font-family:'Courier New',monospace;">${otp}</span>
                </div>
              </div>
              <p style="color:#94A3B8;font-size:13px;line-height:1.5;margin:0 0 8px 0;">
                This code will expire in <strong style="color:#0F172A;">10 minutes</strong>.
              </p>
              <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:0;">
                If you did not request this code, please ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:16px 24px;text-align:center;border-top:1px solid #F1F5F9;">
              <p style="color:#94A3B8;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} ScanLoyal by Logisaar. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPasswordResetEmailHtml(otp) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF6A00,#FF8E3C);padding:32px 24px;text-align:center;">
              <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.5px;">ScanLoyal</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0 0;">Password Reset Request</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="color:#0F172A;font-size:20px;font-weight:700;margin:0 0 8px 0;">Reset Your Password 🔐</h2>
              <p style="color:#64748B;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                We received a request to reset your password. Use the code below:
              </p>
              <!-- OTP Code -->
              <div style="text-align:center;margin:0 0 24px 0;">
                <div style="display:inline-block;background:#FFF7ED;border:2px solid #FF6A00;border-radius:12px;padding:16px 32px;">
                  <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#FF6A00;font-family:'Courier New',monospace;">${otp}</span>
                </div>
              </div>
              <p style="color:#94A3B8;font-size:13px;line-height:1.5;margin:0 0 8px 0;">
                This code will expire in <strong style="color:#0F172A;">10 minutes</strong>.
              </p>
              <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:0;">
                If you did not request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:16px 24px;text-align:center;border-top:1px solid #F1F5F9;">
              <p style="color:#94A3B8;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} ScanLoyal by Logisaar. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Send Functions ─────────────────────────────────────────────

export async function sendVerificationEmail(to, otp) {
  const transport = getTransporter();
  if (!transport) {
    // Stub mode: log OTP to console for development
    logger.info(`[EMAIL STUB] Verification OTP for ${to}: ${otp}`);
    return { success: true, stubbed: true };
  }

  try {
    const info = await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'Verify Your Email Address — ScanLoyal',
      html: buildVerificationEmailHtml(otp),
    });
    logger.info('Verification email sent', { to, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Failed to send verification email', { to, error: err.message });
    return { success: false, error: err.message };
  }
}

export async function sendPasswordResetEmail(to, otp) {
  const transport = getTransporter();
  if (!transport) {
    logger.info(`[EMAIL STUB] Password reset OTP for ${to}: ${otp}`);
    return { success: true, stubbed: true };
  }

  try {
    const info = await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'Reset Your Password — ScanLoyal',
      html: buildPasswordResetEmailHtml(otp),
    });
    logger.info('Password reset email sent', { to, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Failed to send password reset email', { to, error: err.message });
    return { success: false, error: err.message };
  }
}
