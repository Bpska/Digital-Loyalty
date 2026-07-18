import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { Responses } from '../../utils/response.js';
import { authenticateCreator } from '../../middlewares/creatorAuth.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { sendVerificationEmail, sendGeneralNotificationEmail } from '../../utils/email.js';

const router = Router();

// ==========================================
// 1. PUBLIC REGISTRATION & LOGIN
// ==========================================

router.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      instagramUrl,
      facebookUrl,
      linkedinUrl,
      youtubeUrl,
      location,
      city,
      state,
      country,
    } = req.body;

    if (!name || !email || !password || !phone || !location) {
      return Responses.badRequest(res, 'All required fields must be provided');
    }

    const existing = await prisma.creator.findUnique({ where: { email } });
    if (existing) {
      return Responses.badRequest(res, 'Creator with this email already exists');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const passwordHash = await bcrypt.hash(password, 10);

    const creator = await prisma.creator.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        status: 'PENDING',
        isEmailVerified: false,
        otpCode,
        otpExpiresAt,
        profile: {
          create: {
            instagramUrl: instagramUrl || "",
            facebookUrl: facebookUrl || "",
            linkedinUrl: linkedinUrl || "",
            youtubeUrl: youtubeUrl || "",
            location,
            city: city || "",
            state: state || "",
            country: country || "",
          },
        },
      },
    });

    await sendVerificationEmail(email, otpCode);
    return Responses.created(res, { email: creator.email }, 'Registration successful. OTP sent to email.');
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return Responses.badRequest(res, 'Email and OTP code are required');
    }

    const creator = await prisma.creator.findUnique({ where: { email } });
    if (!creator) {
      return Responses.notFound(res, 'Creator not found');
    }

    if (creator.otpCode !== otp || new Date() > new Date(creator.otpExpiresAt)) {
      return Responses.badRequest(res, 'Invalid or expired OTP');
    }

    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        isEmailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return Responses.ok(res, { verified: true }, 'Email verified successfully. Waiting for admin approval.');
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return Responses.badRequest(res, 'Email and password are required');
    }

    const creator = await prisma.creator.findUnique({ where: { email } });
    if (!creator) {
      return Responses.badRequest(res, 'Invalid credentials');
    }

    const match = await bcrypt.compare(password, creator.passwordHash);
    if (!match) {
      return Responses.badRequest(res, 'Invalid credentials');
    }

    if (!creator.isEmailVerified) {
      // Resend OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.creator.update({
        where: { id: creator.id },
        data: { otpCode, otpExpiresAt },
      });
      await sendVerificationEmail(email, otpCode);
      return Responses.ok(res, { requiresVerification: true, email }, 'Email not verified. OTP resent.');
    }

    if (creator.status !== 'APPROVED') {
      return Responses.ok(res, { status: creator.status, name: creator.name }, 'Application pending approval.');
    }

    const token = jwt.sign(
      { id: creator.id, role: 'CREATOR', email: creator.email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '7d' }
    );

    return Responses.ok(res, { token, status: creator.status, name: creator.name });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. CREATOR DASHBOARD PROTECTED ROUTES
// ==========================================

router.get('/dashboard', authenticateCreator, async (req, res, next) => {
  try {
    const creatorId = req.creator.id;

    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: { referralCode: true },
    });

    const referrals = await prisma.creatorReferral.findMany({
      where: { creatorId },
      include: {
        business: {
          select: {
            name: true,
            category: true,
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const commissions = await prisma.creatorCommission.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });

    const withdrawals = await prisma.creatorWithdrawal.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });

    const totalReferrals = referrals.length;
    const activeReferralsCount = referrals.filter(r => r.business.status === 'ACTIVE').length;
    const pendingReferralsCount = referrals.filter(r => r.business.status === 'PENDING').length;

    const totalEarnings = commissions
      .filter(c => c.status === 'APPROVED' || c.status === 'PAID')
      .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

    const withdrawnBalance = withdrawals
      .filter(w => w.status === 'PAID')
      .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0);

    const availableBalance = totalEarnings - withdrawnBalance;

    return Responses.ok(res, {
      referralCode: creator.referralCode?.code || null,
      totalReferrals,
      activeReferralsCount,
      pendingReferralsCount,
      totalEarnings,
      withdrawnBalance,
      availableBalance,
      referrals,
      commissions,
      withdrawals,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/withdrawals', authenticateCreator, async (req, res, next) => {
  try {
    const creatorId = req.creator.id;
    const { amount, method, upiId, accountHolderName, bankName, accountNumber, ifscCode, branchName } = req.body;

    const reqAmt = parseFloat(amount);
    if (isNaN(reqAmt) || reqAmt <= 0) {
      return Responses.badRequest(res, 'Invalid withdrawal amount');
    }

    // Calculate available balance
    const commissions = await prisma.creatorCommission.findMany({
      where: { creatorId },
    });
    const withdrawals = await prisma.creatorWithdrawal.findMany({
      where: { creatorId },
    });

    const totalEarnings = commissions
      .filter(c => c.status === 'APPROVED' || c.status === 'PAID')
      .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

    const requestedWithdrawals = withdrawals
      .filter(w => w.status === 'APPROVED' || w.status === 'PAID' || w.status === 'PENDING')
      .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0);

    const available = totalEarnings - requestedWithdrawals;

    if (reqAmt > available) {
      return Responses.badRequest(res, 'Insufficient balance');
    }

    const withdrawal = await prisma.creatorWithdrawal.create({
      data: {
        creatorId,
        amount: reqAmt,
        method,
        upiId,
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        branchName,
        status: 'PENDING',
      },
    });

    return Responses.created(res, withdrawal, 'Withdrawal request submitted successfully');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. SUPER ADMIN CONTROLS
// ==========================================

// Get all applications
router.get('/admin/applications', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return Responses.forbidden(res, 'Only super admins can view applications');
    }

    const list = await prisma.creator.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    return Responses.ok(res, list);
  } catch (err) {
    next(err);
  }
});

// Approve/Reject Creator Application
router.post('/admin/applications/:id/status', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return Responses.forbidden(res);
    }

    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    const creator = await prisma.creator.findUnique({ where: { id } });
    if (!creator) {
      return Responses.notFound(res, 'Creator application not found');
    }

    let codeObj = null;
    if (status === 'APPROVED') {
      // Generate referral code
      const rand = Math.floor(1000 + Math.random() * 9000);
      const code = `SLR-${creator.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}-${rand}`;

      codeObj = await prisma.creatorReferralCode.create({
        data: {
          code,
          creatorId: id,
        },
      });

      await prisma.creator.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      await sendGeneralNotificationEmail(
        creator.email,
        'Congratulations! Your ScanLoyal Partner Application has been Approved 🎉',
        `Your application is approved. Start referring businesses using your unique Referral Code: <strong>${code}</strong>`
      );
    } else {
      await prisma.creator.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      await sendGeneralNotificationEmail(
        creator.email,
        'ScanLoyal Partner Application Update',
        `We regret to inform you that your application has been rejected at this time.`
      );
    }

    return Responses.ok(res, { status, code: codeObj?.code || null });
  } catch (err) {
    next(err);
  }
});

// Get all withdrawals for admin
router.get('/admin/withdrawals', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return Responses.forbidden(res);
    }

    const list = await prisma.creatorWithdrawal.findMany({
      include: { creator: true },
      orderBy: { createdAt: 'desc' },
    });

    return Responses.ok(res, list);
  } catch (err) {
    next(err);
  }
});

// Update withdrawal status
router.post('/admin/withdrawals/:id/status', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return Responses.forbidden(res);
    }

    const { id } = req.params;
    const { status } = req.body; // APPROVED, PAID, REJECTED

    const w = await prisma.creatorWithdrawal.findUnique({
      where: { id },
      include: { creator: true },
    });
    if (!w) {
      return Responses.notFound(res, 'Withdrawal request not found');
    }

    await prisma.creatorWithdrawal.update({
      where: { id },
      data: { status },
    });

    await sendGeneralNotificationEmail(
      w.creator.email,
      'Withdrawal Request Status Update',
      `Your withdrawal request of ₹${w.amount} has been updated to <strong>${status}</strong>.`
    );

    return Responses.ok(res, { status });
  } catch (err) {
    next(err);
  }
});

export default router;
