import { Router } from 'express';
import { authenticate, authorize, requireSameBusiness } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { auditLog } from '../../middlewares/audit.middleware.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';
import {
  generateQrToken,
  generateQrImage,
  generateQrBuffer,
} from '../../utils/qrGenerator.js';
import { generateQrPdf } from '../../utils/pdfGenerator.js';
import { env } from '../../config/env.js';

const router = Router();

const branchSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(10).max(1000).default(50),
  isActive: z.boolean().optional(),
});

// ── List branches for a business ──────────────────────────────
router.get('/business/:businessId', authenticate, async (req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { businessId: req.params.businessId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { checkIns: true, staff: true } },
      },
    });
    sendSuccess(res, branches);
  } catch (err) {
    next(err);
  }
});

// ── Create branch ─────────────────────────────────────────────
router.post(
  '/business/:businessId',
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN),
  requireSameBusiness,
  validate(branchSchema),
  auditLog('BRANCH_CREATED', 'Branch'),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;

      // Enforce plan branch limit
      const business = await prisma.business.findUniqueOrThrow({
        where: { id: businessId },
        include: { plan: true, _count: { select: { branches: true } } },
      });

      if (business.plan && business._count.branches >= business.plan.maxBranches) {
        throw new AppError(
          `Branch limit reached for your plan (max ${business.plan.maxBranches}). Please upgrade.`,
          403
        );
      }

      const branchId = `br-${Date.now()}`;
      const qrToken = generateQrToken();

      const branch = await prisma.branch.create({
        data: {
          ...req.body,
          id: branchId,
          businessId,
          qrToken,
        },
      });
      sendCreated(res, branch, 'Branch created');
    } catch (err) {
      next(err);
    }
  }
);

// ── Update branch ─────────────────────────────────────────────
router.patch(
  '/:branchId',
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN),
  validate(branchSchema.partial()),
  auditLog('BRANCH_UPDATED', 'Branch'),
  async (req, res, next) => {
    try {
      const branch = await prisma.branch.update({
        where: { id: req.params.branchId },
        data: req.body,
      });
      sendSuccess(res, branch, 'Branch updated');
    } catch (err) {
      next(err);
    }
  }
);

// ── Get QR image for a branch ─────────────────────────────────
router.get(
  '/:branchId/qr',
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN),
  async (req, res, next) => {
    try {
      const branch = await prisma.branch.findUniqueOrThrow({
        where: { id: req.params.branchId },
        include: {
          business: {
            select: { name: true },
          },
        },
      });

      const payloadUrl = `${env.FRONTEND_URL}/checkin?businessId=${branch.businessId}&branchId=${branch.id}&token=${branch.qrToken}`;
      const format = req.query.format === 'pdf' ? 'pdf' : (req.query.format === 'png' ? 'png' : 'base64');

      if (format === 'pdf') {
        const qrBuffer = await generateQrBuffer(payloadUrl);
        const pdfBuffer = await generateQrPdf(
          branch.business.name,
          branch.name,
          branch.address,
          qrBuffer
        );
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename="poster-${branch.name.replace(/\s+/g, "_")}.pdf"`);
        res.send(pdfBuffer);
      } else if (format === 'png') {
        const buffer = await generateQrBuffer(payloadUrl);
        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', `attachment; filename="qr-${branch.name.replace(/\s+/g, "_")}.png"`);
        res.send(buffer);
      } else {
        const dataUrl = await generateQrImage(payloadUrl);
        sendSuccess(res, { qrImage: dataUrl, payload: payloadUrl });
      }
    } catch (err) {
      next(err);
    }
  }
);

// ── Delete branch ─────────────────────────────────────────────
router.delete(
  '/:branchId',
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN),
  auditLog('BRANCH_DELETED', 'Branch'),
  async (req, res, next) => {
    try {
      const { branchId } = req.params;
      const prisma = (await import('../../config/prisma.js')).default;

      // Delete in transaction to handle relations
      await prisma.$transaction(async (tx) => {
        // 1. Delete all check-ins associated with this branch
        await tx.checkIn.deleteMany({ where: { branchId } });
        
        // 2. Clear branch associations from staff
        await tx.staff.updateMany({ where: { branchId }, data: { branchId: null } });
        
        // 3. Delete the branch itself
        await tx.branch.delete({ where: { id: branchId } });
      });

      sendSuccess(res, null, 'Branch deleted successfully');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
