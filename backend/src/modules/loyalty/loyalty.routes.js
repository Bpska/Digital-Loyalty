import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role, LoyaltyType, LoyaltyResetMode } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

import { auditLog } from '../../middlewares/audit.middleware.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';

const router = Router();

const loyaltyProgramSchema = z.object({
  businessId: z.string(),
  type: z.nativeEnum(LoyaltyType),
  threshold: z.coerce.number().int().positive(),
  pointsPerVisit: z.coerce.number().int().positive().optional().default(10),
  resetMode: z.nativeEnum(LoyaltyResetMode).default(LoyaltyResetMode.FULL_RESET),
  rewardId: z.string(),
  isActive: z.boolean().optional(),
});

// List loyalty programs for a business
router.get('/business/:businessId', authenticate, async (req, res, next) => {
  try {
    const programs = await prisma.loyaltyProgram.findMany({
      where: { businessId: req.params.businessId },
      include: { reward: { select: { id: true, title: true, isActive: true } } },
    });
    sendSuccess(res, programs);
  } catch (err) { next(err); }
});

// Create loyalty program
router.post('/', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), validate(loyaltyProgramSchema), auditLog('LOYALTY_PROGRAM_CREATED', 'LoyaltyProgram'), async (req, res, next) => {
  try {
    // Deactivate previous program of same type
    await prisma.loyaltyProgram.updateMany({
      where: { businessId: req.body.businessId, type: req.body.type, isActive: true },
      data: { isActive: false },
    });
    const program = await prisma.loyaltyProgram.create({ data: req.body, include: { reward: true } });
    sendCreated(res, program, 'Loyalty program created');
  } catch (err) { next(err); }
});

// Update loyalty program
router.patch('/:programId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), validate(loyaltyProgramSchema.partial()), async (req, res, next) => {
  try {
    const program = await prisma.loyaltyProgram.update({ where: { id: req.params.programId }, data: req.body });
    sendSuccess(res, program, 'Loyalty program updated');
  } catch (err) { next(err); }
});

// Delete loyalty program
router.delete('/:programId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    await prisma.loyaltyProgram.delete({ where: { id: req.params.programId } });
    sendSuccess(res, null, 'Loyalty program deleted');
  } catch (err) { next(err); }
});

export default router;
