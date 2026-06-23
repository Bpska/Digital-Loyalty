import { Router } from 'express';
import { authenticate, authorize, requireSameBusiness } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma.js';

import {
  generateReviewSchema,
  trackSelectionSchema,
  trackClickSchema,
  reviewSettingsSchema,
} from './review.validator.js';

import {
  generateReviewSuggestions,
  trackReviewSelection,
  trackReviewLinkClick,
  getReviewSettings,
  saveReviewSettings,
  getGoogleReviewUrl,
} from './review.service.js';

const router = Router();

/**
 * POST /api/v1/reviews/generate
 * Customer: generate 5 AI review suggestions after check-in / reward redemption.
 */
router.post(
  '/generate',
  authenticate,
  authorize(Role.CUSTOMER),
  validate(generateReviewSchema),
  async (req, res, next) => {
    try {
      const { businessId, rating } = req.body;
      const userId = req.user.sub;

      const result = await generateReviewSuggestions(userId, businessId, rating);

      sendSuccess(res, {
        generationId: result.generationId,
        reviews: result.reviews,
      }, 'Review suggestions generated successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/reviews/track-selection
 * Customer: record which review they selected.
 */
router.post(
  '/track-selection',
  authenticate,
  authorize(Role.CUSTOMER),
  validate(trackSelectionSchema),
  async (req, res, next) => {
    try {
      const { reviewGenerationId, selectedReview } = req.body;
      await trackReviewSelection(req.user.sub, reviewGenerationId, selectedReview);
      sendSuccess(res, null, 'Review selection tracked');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/reviews/track-click
 * Customer: record when they click the "Open Google Reviews" button.
 */
router.post(
  '/track-click',
  authenticate,
  authorize(Role.CUSTOMER),
  validate(trackClickSchema),
  async (req, res, next) => {
    try {
      const { reviewGenerationId } = req.body;
      await trackReviewLinkClick(req.user.sub, reviewGenerationId);
      sendSuccess(res, null, 'Review link click tracked');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/reviews/google-url/:businessId
 * Customer (public-ish): get the Google Review URL for a business.
 * Requires authentication to prevent enumeration.
 */
router.get(
  '/google-url/:businessId',
  authenticate,
  async (req, res, next) => {
    try {
      const url = await getGoogleReviewUrl(req.params.businessId);
      sendSuccess(res, { googleReviewUrl: url });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/reviews/business-details/:businessId
 * Customer: get public details of the business (name, logo, social urls) for the review page.
 */
router.get(
  '/business-details/:businessId',
  authenticate,
  async (req, res, next) => {
    try {
      const business = await prisma.business.findFirst({
        where: { id: req.params.businessId, deletedAt: null },
        include: { reviewSettings: true },
      });
      if (!business) throw new AppError('Business not found', 404);
      sendSuccess(res, {
        id: business.id,
        name: business.name,
        logoUrl: business.logoUrl,
        googleReviewUrl: business.reviewSettings?.googleReviewUrl || business.googleReviewUrl || null,
        instagramUrl: business.reviewSettings?.instagramUrl || business.instagramUrl || null,
        facebookUrl: business.reviewSettings?.facebookUrl || business.facebookUrl || null,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/reviews/settings/:businessId
 * Business Admin: get review generator settings for their business.
 */
router.get(
  '/settings/:businessId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  requireSameBusiness,
  async (req, res, next) => {
    try {
      const settings = await getReviewSettings(req.params.businessId);
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/reviews/settings/:businessId
 * Business Admin: save/update review generator settings.
 */
router.post(
  '/settings/:businessId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  requireSameBusiness,
  validate(reviewSettingsSchema),
  async (req, res, next) => {
    try {
      const settings = await saveReviewSettings(req.params.businessId, req.body);
      sendSuccess(res, settings, 'Review settings saved');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
