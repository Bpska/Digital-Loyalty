import { z } from 'zod';

/**
 * Validation schemas for the Reviews module.
 */

/** POST /api/v1/reviews/generate */
export const generateReviewSchema = z.object({
  businessId: z.string().min(1, 'businessId is required'),
  rating: z.number().int().min(1).max(5),
});

/** POST /api/v1/reviews/track-selection */
export const trackSelectionSchema = z.object({
  reviewGenerationId: z.string().min(1, 'reviewGenerationId is required'),
  selectedReview: z.string().min(1, 'selectedReview is required'),
});

/** POST /api/v1/reviews/track-click */
export const trackClickSchema = z.object({
  reviewGenerationId: z.string().min(1, 'reviewGenerationId is required'),
});

/** POST /api/v1/reviews/settings/:businessId */
export const reviewSettingsSchema = z.object({
  businessType: z.string().max(100).optional().nullable(),
  googleReviewUrl: z.string().url().optional().nullable().or(z.literal('')).transform(v => v || null),
  instagramUrl: z.string().url().optional().nullable().or(z.literal('')).transform(v => v || null),
  facebookUrl: z.string().url().optional().nullable().or(z.literal('')).transform(v => v || null),
});
