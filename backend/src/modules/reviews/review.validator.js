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
  templateId: z.string().optional().nullable(),
});

/** POST /api/v1/reviews/track-click */
export const trackClickSchema = z.object({
  reviewGenerationId: z.string().min(1, 'reviewGenerationId is required'),
});

/** POST /api/v1/reviews/settings/:businessId */
export const reviewSettingsSchema = z.object({
  businessType: z.string().max(100).optional().nullable(),
  googleReviewUrl: z.string().url().optional().nullable().or(z.literal('')).refine(val => {
    if (!val) return true;
    try {
      const hostname = new URL(val).hostname.toLowerCase();
      return hostname.includes('google.') || hostname.includes('g.page');
    } catch (_) {
      return false;
    }
  }, { message: 'Must be a valid Google link' }).transform(v => v || null),
  instagramUrl: z.string().url().optional().nullable().or(z.literal('')).refine(val => {
    if (!val) return true;
    try {
      const hostname = new URL(val).hostname.toLowerCase();
      return hostname.includes('instagram.com');
    } catch (_) {
      return false;
    }
  }, { message: 'Must be a valid Instagram link' }).transform(v => v || null),
  facebookUrl: z.string().url().optional().nullable().or(z.literal('')).refine(val => {
    if (!val) return true;
    try {
      const hostname = new URL(val).hostname.toLowerCase();
      return hostname.includes('facebook.com') || hostname.includes('fb.com');
    } catch (_) {
      return false;
    }
  }, { message: 'Must be a valid Facebook link' }).transform(v => v || null),
  googleBusinessName: z.string().max(200).optional().nullable(),
  googlePlaceId: z.string().max(200).optional().nullable(),
});
