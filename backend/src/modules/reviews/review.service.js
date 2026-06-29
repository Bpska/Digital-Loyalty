import axios from 'axios';
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
    googleBusinessName: business.reviewSettings?.googleBusinessName || null,
    googlePlaceId: business.reviewSettings?.googlePlaceId || null,
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

  const updateData = { ...data };

  // Generate review link automatically if googlePlaceId is provided
  if (updateData.googlePlaceId) {
    updateData.googleReviewUrl = `https://search.google.com/local/writereview?placeid=${updateData.googlePlaceId}`;
  }

  // Upsert the dedicated review settings record
  const settings = await prisma.businessReviewSettings.upsert({
    where: { businessId },
    update: updateData,
    create: { businessId, ...updateData },
  });

  // Sync googleReviewUrl to the main Business record for backwards compatibility
  if (updateData.googleReviewUrl !== undefined) {
    await prisma.business.update({
      where: { id: businessId },
      data: { googleReviewUrl: updateData.googleReviewUrl },
    });
  }

  return settings;
}

/**
 * Search Google Places by business name + branch location.
 * Falls back to realistic local mock listing data if GOOGLE_PLACES_API_KEY is not set.
 */
export async function searchGooglePlaces(query, businessId) {
  // Try to find the business address/location to refine search
  const branches = await prisma.branch.findMany({
    where: { businessId, isActive: true },
    select: { address: true, latitude: true, longitude: true },
  });

  const primaryBranch = branches[0];
  const locationContext = primaryBranch?.address || '';
  const searchQuery = `${query} ${locationContext}`.trim();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'mock' || apiKey === 'stub') {
    // Return realistic mock candidates based on the query name and address
    return [
      {
        placeId: `mock_place_cp_${Math.floor(Math.random() * 100000)}`,
        name: `${query} (Connaught Place)`,
        formattedAddress: `${primaryBranch?.address || 'Block A, Connaught Place, New Delhi, Delhi 110001'}`
      },
      {
        placeId: `mock_place_in_${Math.floor(Math.random() * 100000)}`,
        name: `${query} (Indiranagar)`,
        formattedAddress: '100 Feet Rd, Hal 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038'
      },
      {
        placeId: `mock_place_bw_${Math.floor(Math.random() * 100000)}`,
        name: `${query} (Bandra West)`,
        formattedAddress: 'Carter Rd, Bandra West, Mumbai, Maharashtra 400050'
      }
    ];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`;
    const response = await axios.get(url);
    const candidates = response.data?.candidates || [];
    
    return candidates.map(c => ({
      placeId: c.place_id,
      name: c.name,
      formattedAddress: c.formatted_address,
    }));
  } catch (error) {
    console.error('Google Places API search failed, falling back to mock:', error.message);
    return [
      {
        placeId: `mock_place_fallback_${Math.floor(Math.random() * 100000)}`,
        name: `${query} (Simulated Google Place)`,
        formattedAddress: `${primaryBranch?.address || '123 Business Street, Local Area'}`
      }
    ];
  }
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
