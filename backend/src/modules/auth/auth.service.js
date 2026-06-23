 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { Role, BusinessStatus } from '@prisma/client';
import crypto from 'crypto';
import argon2 from 'argon2';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middlewares/error.middleware.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,

} from '../../middlewares/auth.middleware.js';
import {
  generateOtp,
  hashOtp,
  verifyOtp,

  getOtpExpiry,
  normalizePhone,
  sendOtpViaSms,
} from '../../utils/otp.js';
import { logger } from '../../utils/logger.js';



























// ─────────────────────────────────────────────────────────────
// OTP Auth (Customers)
// ─────────────────────────────────────────────────────────────

/**
 * Step 1 of customer auth: generate and send OTP.
 * Rate limited at the route level.
 */
export async function sendCustomerOtp(input) {
  const phone = normalizePhone(input.phone);

  // Invalidate any previous unverified OTPs for this phone
  await prisma.otpVerification.updateMany({
    where: { phone, verified: false },
    data: { expiresAt: new Date() }, // expire them now
  });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = getOtpExpiry();

  const record = await prisma.otpVerification.create({
    data: { phone, otpHash, expiresAt },
  });

  const result = await sendOtpViaSms(phone, otp, env.OTP_PROVIDER);
  if (!result.success) {
    logger.error('OTP send failed', { phone, error: result.error });
    throw new AppError('Failed to send OTP. Please try again.', 503);
  }

  logger.info('OTP sent', { phone, requestId: result.requestId });
  return { requestId: record.id };
}

/**
 * Step 2 of customer auth: verify OTP and issue tokens.
 * Creates the user account on first login (registration).
 */
export async function verifyCustomerOtp(
  input,
  ipAddress
) {
  const phone = normalizePhone(input.phone);

  // Find most recent valid OTP for this phone
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      phone,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new AppError('OTP expired or not found. Please request a new one.', 400);
  }

  if (otpRecord.attempts >= 3) {
    throw new AppError('Too many failed attempts. Please request a new OTP.', 429);
  }

  const isValid = await verifyOtp(input.otp, otpRecord.otpHash);

  if (!isValid) {
    // Increment attempt counter
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError('Invalid OTP', 400);
  }

  // Mark OTP as verified
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Find or create customer user
  let user = await prisma.user.findFirst({
    where: { phone, deletedAt: null },
  });

  if (!user) {
    if (!input.name) {
      throw new AppError('Name is required for new account registration.', 400);
    }
    user = await prisma.user.create({
      data: {
        phone,
        name: input.name,
        role: Role.CUSTOMER,
      },
    });
    logger.info('New customer registered', { userId: user.id, phone });
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  return issueTokens({ id: user.id, role: user.role, businessId: null, branchId: null }, ipAddress);
}

export async function registerCustomer(
  input,
  ipAddress
) {
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);

  // Check if email already exists
  const existingEmail = await prisma.user.findFirst({
    where: { email },
  });
  if (existingEmail) {
    throw new AppError('Email already registered', 400);
  }

  // Check if phone already exists
  const existingPhone = await prisma.user.findFirst({
    where: { phone },
  });
  if (existingPhone) {
    throw new AppError('Phone number already registered', 400);
  }

  // Hash password
  const passwordHash = await argon2.hash(input.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      phone,
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  logger.info('Customer registered via email/password', { userId: user.id, email });

  const tokenUser = {
    id: user.id,
    role: user.role,
    businessId: null,
    branchId: null,
  };

  return issueTokens(tokenUser, ipAddress);
}

export async function registerBusiness(
  input,
  ipAddress
) {
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);

  // Check if email already exists
  const existingEmail = await prisma.user.findFirst({
    where: { email },
  });
  if (existingEmail) {
    throw new AppError('Email already registered', 400);
  }

  // Check if phone already exists
  const existingPhone = await prisma.user.findFirst({
    where: { phone },
  });
  if (existingPhone) {
    throw new AppError('Phone number already registered', 400);
  }

  // Hash password
  const passwordHash = await argon2.hash(input.password);

  let user;
  let b;

  await prisma.$transaction(async (tx) => {
    // 1. Create user with role BUSINESS_ADMIN
    user = await tx.user.create({
      data: {
        name: input.name,
        email,
        phone,
        passwordHash,
        role: Role.BUSINESS_ADMIN,
      },
    });

    // 2. Create business with status PENDING
    b = await tx.business.create({
      data: {
        name: input.businessName,
        phone,
        address: input.address || 'Main Address',
        timezone: 'Asia/Kolkata',
        category: input.category || null,
        bookingUrl: input.bookingUrl || null,
        status: BusinessStatus.PENDING,
        ownerId: user.id,
      },
    });

    // 3. Create default main branch
    const branchId = `br-${Date.now()}`;
    const qrToken = crypto.randomBytes(32).toString('hex');

    await tx.branch.create({
      data: {
        id: branchId,
        name: `${b.name} Main Branch`,
        address: b.address || 'Main Address',
        latitude: 20.2961, // default Bhubaneswar lat
        longitude: 85.8245, // default Bhubaneswar lng
        radiusMeters: 50,
        qrToken,
        businessId: b.id,
      },
    });
  });

  logger.info('New business admin registered and auto-logged in', { email, businessName: input.businessName });

  const tokenUser = {
    id: user.id,
    role: user.role,
    businessId: b.id,
    branchId: null,
  };

  return issueTokens(tokenUser, ipAddress);
}

export async function loginWithGoogle(
  input,
  ipAddress
) {
  // 1. Verify idToken with Google tokeninfo endpoint
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(input.idToken)}`
  );
  if (!response.ok) {
    throw new AppError('Invalid Google authentication token', 400);
  }
  const payload = (await response.json()) ;

  // Verify client ID against configuration or hardcoded fallback
  const configClientId = env.GOOGLE_CLIENT_ID || '240748277924-ds46b01veci1o7k23e7s9hkiuf3khes4.apps.googleusercontent.com';
  if (payload.aud !== configClientId && payload.azp !== configClientId) {
    throw new AppError('Google token client ID mismatch', 400);
  }

  const email = _optionalChain([payload, 'access', _ => _.email, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3(), 'access', _4 => _4.toLowerCase, 'call', _5 => _5()]);
  const name = payload.name;
  if (!email) {
    throw new AppError('Google account does not provide an email address.', 400);
  }

  // 2. Find if user already exists by email
  let user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  // If user does not exist, check if a phone was provided for registration
  if (!user) {
    if (!input.phone) {
      // User doesn't exist and didn't provide a phone number yet, return info to frontend
      return {
        newUser: true,
        email,
        name,
        tokens: { accessToken: '', refreshToken: '' },
        user: { id: '', name: '', phone: '', email: '', role: Role.CUSTOMER, businessId: null, branchId: null },
      };
    }

    const phone = normalizePhone(input.phone);

    // Check if phone number already belongs to another user
    const existingPhone = await prisma.user.findFirst({
      where: { phone, deletedAt: null },
    });

    if (existingPhone) {
      if (!existingPhone.email) {
        // Link Google email to this existing OTP customer
        user = await prisma.user.update({
          where: { id: existingPhone.id },
          data: { email, name: name || existingPhone.name },
        });
        logger.info('Linked Google account to existing OTP customer', { userId: user.id, email });
      } else if (existingPhone.email !== email) {
        throw new AppError('Phone number already registered with another account.', 400);
      } else {
        user = existingPhone;
      }
    } else {
      // Create new customer account
      user = await prisma.user.create({
        data: {
          name: name || 'Google Customer',
          email,
          phone,
          role: Role.CUSTOMER,
        },
      });
      logger.info('New customer registered via Google login', { userId: user.id, email });
    }
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  const tokenUser = {
    id: user.id,
    role: user.role,
    businessId: null,
    branchId: null,
  };

  return issueTokens(tokenUser, ipAddress);
}


// ─────────────────────────────────────────────────────────────
// Password Auth (Everyone — Customer, Staff, Admins)
// ─────────────────────────────────────────────────────────────

export async function passwordLogin(
  input,
  ipAddress
) {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: {
      staffProfile: {
        select: { businessId: true, branchId: true },
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Contact support.', 403);
  }

  if (!user.passwordHash) {
    throw new AppError('Password not set. Please contact support.', 400);
  }

  const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokenUser = {
    id: user.id,
    role: user.role,
    businessId: _nullishCoalesce(_optionalChain([user, 'access', _6 => _6.staffProfile, 'optionalAccess', _7 => _7.businessId]), () => ( null)),
    branchId: _nullishCoalesce(_optionalChain([user, 'access', _8 => _8.staffProfile, 'optionalAccess', _9 => _9.branchId]), () => ( null)),
  };

  // For BUSINESS_ADMIN, businessId comes from their owned business
  if (user.role === Role.BUSINESS_ADMIN) {
    const business = await prisma.business.findFirst({
      where: { ownerId: user.id, deletedAt: null },
      select: { id: true, status: true },
    });
    tokenUser.businessId = _nullishCoalesce(_optionalChain([business, 'optionalAccess', _10 => _10.id]), () => ( null));
  }

  logger.info('Password login successful', { userId: user.id, role: user.role });
  return issueTokens(tokenUser, ipAddress);
}

// ─────────────────────────────────────────────────────────────
// Token Refresh
// ─────────────────────────────────────────────────────────────

export async function refreshTokens(
  rawRefreshToken,
  ipAddress
) {
  const payload = verifyRefreshToken(rawRefreshToken);

  // Hash the incoming token to find it in DB
  const tokenHash = crypto
    .createHash('sha256')
    .update(rawRefreshToken)
    .digest('hex');

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || new Date() > stored.expiresAt) {
    throw new AppError('Refresh token invalid or expired', 401);
  }

  if (stored.userId !== payload.sub) {
    // Token tampering attempt — revoke all tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId },
      data: { revokedAt: new Date() },
    });
    throw new AppError('Token mismatch. All sessions revoked.', 401);
  }

  // Revoke old token (rotation)
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  // Fetch updated user for fresh token payload
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { staffProfile: { select: { businessId: true, branchId: true } } },
  });
  if (!user || !user.isActive) {
    throw new AppError('User not found or deactivated', 401);
  }

  let businessId = _nullishCoalesce(_optionalChain([user, 'access', _11 => _11.staffProfile, 'optionalAccess', _12 => _12.businessId]), () => ( null));
  if (user.role === Role.BUSINESS_ADMIN) {
    const biz = await prisma.business.findFirst({
      where: { ownerId: user.id, deletedAt: null },
      select: { id: true, status: true },
    });
    businessId = _nullishCoalesce(_optionalChain([biz, 'optionalAccess', _13 => _13.id]), () => ( null));
  }

  const tokenUser = {
    id: user.id,
    role: user.role,
    businessId,
    branchId: _nullishCoalesce(_optionalChain([user, 'access', _14 => _14.staffProfile, 'optionalAccess', _15 => _15.branchId]), () => ( null)),
  };

  const { tokens } = await issueTokens(tokenUser, ipAddress);
  return tokens;
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────

export async function logout(rawRefreshToken) {
  const tokenHash = crypto
    .createHash('sha256')
    .update(rawRefreshToken)
    .digest('hex');

  await prisma.refreshToken
    .updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    .catch(() => {}); // Best-effort — don't fail logout on DB error
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

async function issueTokens(tokenUser, ipAddress) {
  const accessToken = signAccessToken(tokenUser);
  const rawRefreshToken = signRefreshToken(tokenUser.id);

  // Store hashed refresh token for revocation support
  const tokenHash = crypto
    .createHash('sha256')
    .update(rawRefreshToken)
    .digest('hex');

  await prisma.refreshToken.create({
    data: {
      userId: tokenUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ipAddress: _nullishCoalesce(ipAddress, () => ( null)),
    },
  });

  // Clean up expired tokens for this user (background housekeeping)
  prisma.refreshToken
    .deleteMany({
      where: {
        userId: tokenUser.id,
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
      },
    })
    .catch(() => {});

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: tokenUser.id },
    select: { id: true, name: true, phone: true, email: true, role: true },
  });

  return {
    tokens: { accessToken, refreshToken: rawRefreshToken },
    user: { ...user, businessId: tokenUser.businessId, branchId: tokenUser.branchId },
  };
}
