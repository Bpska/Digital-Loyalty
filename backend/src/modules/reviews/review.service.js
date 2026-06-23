import prisma from '../../config/prisma.js';
import { generateReviews } from './ollama.service.js';
import { AppError } from '../../middlewares/error.middleware.js';

// ──────────────────────────────────────────────────────────────
// REVIEW GENERATION
// ──────────────────────────────────────────────────────────────

/**
 * Generate 5 AI review suggestions for a customer.
 * Saves a ReviewGeneration record for analytics.
 *
 * @param {string} userId     - Authenticated customer's user ID
 * @param {string} businessId - Target business
 * @param {number} rating     - 1–5 star rating
 * @returns {{ generationId: string, reviews: string[] }}
 */
export async function generateReviewSuggestions(userId, businessId, rating) {
  // Verify business exists
  const business = await prisma.business.findFirst({
    where: { id: businessId, deletedAt: null },
    include: { reviewSettings: true },
  });

  if (!business) {
    throw new AppError('Business not found', 404);
  }

  const businessType = business.reviewSettings?.businessType || business.name || 'Business';

  // Call Ollama (or fallback)
  const reviews = await generateReviews(businessType, rating);

  // Persist analytics record
  const record = await prisma.reviewGeneration.create({
    data: {
      userId,
      businessId,
      rating,
      generatedReviews: reviews,
    },
  });

  return {
    generationId: record.id,
    reviews,
  };
}

// ──────────────────────────────────────────────────────────────
// REVIEW SELECTION TRACKING
// ──────────────────────────────────────────────────────────────

/**
 * Track which review the customer selected.
 */
export async function trackReviewSelection(userId, reviewGenerationId, selectedReview) {
  const record = await prisma.reviewGeneration.findUnique({
    where: { id: reviewGenerationId },
  });

  if (!record) throw new AppError('Review generation record not found', 404);
  if (record.userId !== userId) throw new AppError('Forbidden', 403);

  await prisma.reviewGeneration.update({
    where: { id: reviewGenerationId },
    data: { selectedReview },
  });
}

/**
 * Track when the customer clicks the "Open Google Reviews" button.
 */
export async function trackReviewLinkClick(userId, reviewGenerationId) {
  const record = await prisma.reviewGeneration.findUnique({
    where: { id: reviewGenerationId },
  });

  if (!record) throw new AppError('Review generation record not found', 404);
  if (record.userId !== userId) throw new AppError('Forbidden', 403);

  await prisma.reviewGeneration.update({
    where: { id: reviewGenerationId },
    data: { reviewLinkClicked: true },
  });
}

// ──────────────────────────────────────────────────────────────
// BUSINESS REVIEW SETTINGS
// ──────────────────────────────────────────────────────────────

/**
 * Get review settings for a business.
 * Also merges the Google Review URL from the Business model as fallback.
 */
export async function getReviewSettings(businessId) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, deletedAt: null },
    include: { reviewSettings: true },
  });

  if (!business) throw new AppError('Business not found', 404);

  // Merge settings: dedicated review settings table takes priority
  return {
    businessType: business.reviewSettings?.businessType || null,
    googleReviewUrl: business.reviewSettings?.googleReviewUrl || business.googleReviewUrl || null,
    instagramUrl: business.reviewSettings?.instagramUrl || business.instagramUrl || null,
    facebookUrl: business.reviewSettings?.facebookUrl || business.facebookUrl || null,
  };
}

/**
 * Upsert review settings for a business.
 * Also syncs googleReviewUrl back to the Business model for compatibility.
 */
export async function saveReviewSettings(businessId, data) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, deletedAt: null },
  });

  if (!business) throw new AppError('Business not found', 404);

  // Upsert the dedicated review settings record
  const settings = await prisma.businessReviewSettings.upsert({
    where: { businessId },
    update: data,
    create: { businessId, ...data },
  });

  // Sync googleReviewUrl to the main Business record for backwards compatibility
  if (data.googleReviewUrl !== undefined) {
    await prisma.business.update({
      where: { id: businessId },
      data: { googleReviewUrl: data.googleReviewUrl },
    });
  }

  return settings;
}

// ──────────────────────────────────────────────────────────────
// PUBLIC: Get only the Google Review URL for a business
// (Used by the customer review page to open the Google link)
// ──────────────────────────────────────────────────────────────
export async function getGoogleReviewUrl(businessId) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, deletedAt: null },
    include: { reviewSettings: true },
  });

  if (!business) throw new AppError('Business not found', 404);

  return (
    business.reviewSettings?.googleReviewUrl ||
    business.googleReviewUrl ||
    null
  );
}
