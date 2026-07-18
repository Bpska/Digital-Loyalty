import axios from 'axios';
import prisma from '../../config/prisma.js';
import { generateReviews } from './ollama.service.js';
import { AppError } from '../../middlewares/error.middleware.js';

// ──────────────────────────────────────────────────────────────
// REVIEW GENERATION
// ──────────────────────────────────────────────────────────────

/**
 * Fetch 3 random pre-written reviews.
 * Saves a ReviewGeneration record for analytics.
 * Bypasses Ollama/AI.
 *
 * @param {string} userId     - Authenticated customer's user ID
 * @param {string} businessId - Target business
 * @param {number} rating     - 1–5 star rating (mapped to star_rating)
 * @returns {{ generationId: string, reviews: { id: string, text: string }[] }}
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

  // 1. Reservation cleanup: Release expired reservations (older than 10 minutes) in the background
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  prisma.reviewTemplate.updateMany({
    where: {
      status: 'RESERVED',
      reservedAt: { lt: tenMinutesAgo },
    },
    data: {
      status: 'AVAILABLE',
      reservedById: null,
      reservedAt: null,
    },
  }).catch((err) => {
    console.error("Error in background review reservation cleanup:", err);
  });

  // 2. Fetch templates
  const category = business.reviewSettings?.businessType || business.category || 'Business';
  let normalizedCategory = 'Business';
  if (category) {
    normalizedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
  }

  // Find available templates matching rating and category (exact match for speed)
  const templates = await prisma.reviewTemplate.findMany({
    where: {
      status: 'AVAILABLE',
      starRating: rating,
      businessCategory: normalizedCategory,
    },
  });

  let selectedTemplates = templates.map(t => ({ id: t.id, reviewText: t.reviewText }));

  // If we have fewer than 3 templates, pull fallbacks from 'Business' category in DB
  if (selectedTemplates.length < 3) {
    const fallbackDb = await prisma.reviewTemplate.findMany({
      where: {
        status: 'AVAILABLE',
        starRating: rating,
        businessCategory: 'Business',
        id: {
          notIn: selectedTemplates.map((t) => t.id),
        },
      },
    });
    selectedTemplates = [...selectedTemplates, ...fallbackDb.map(t => ({ id: t.id, reviewText: t.reviewText }))];
  }

  // Hardcoded fallback review templates if DB has no reviews seeded (ensures prod never breaks)
  const STATIC_FALLBACKS = {
    3: [
      "Average experience. The service was okay but there is room for improvement.",
      "Decent visit. Everything was fine, but nothing particularly stood out.",
      "Okay experience. Clean place and polite staff, but wait times were slightly long."
    ],
    4: [
      "Great service and friendly staff! Had a very good experience and will visit again.",
      "Really liked the quality and hospitality here. Definitely recommend it to others.",
      "Very pleasant experience! Clean environment, good atmosphere, and helpful team."
    ],
    5: [
      "Absolutely amazing! Extremely satisfied with the service and quality. Highly recommended!",
      "Outstanding experience! Excellent customer support and top-notch hospitality.",
      "Fantastic place! The staff goes above and beyond to make you feel welcome. 10/10!"
    ]
  };

  if (selectedTemplates.length < 3) {
    const defaultTexts = STATIC_FALLBACKS[rating] || STATIC_FALLBACKS[5];
    defaultTexts.forEach((txt, idx) => {
      if (selectedTemplates.length < 3 && !selectedTemplates.some(t => t.reviewText === txt)) {
        selectedTemplates.push({
          id: `fallback-${rating}-${idx}`,
          reviewText: txt
        });
      }
    });
  }

  // Shuffle and pick 3
  const shuffled = selectedTemplates.sort(() => 0.5 - Math.random());
  const finalTemplates = shuffled.slice(0, 3);

  // Extract text array to save in the legacy generatedReviews field for analytics/safety
  const reviewTexts = finalTemplates.map((t) => t.reviewText);

  // Persist analytics record
  const record = await prisma.reviewGeneration.create({
    data: {
      userId,
      businessId,
      rating,
      generatedReviews: reviewTexts,
    },
  });

  return {
    generationId: record.id,
    reviews: finalTemplates.map((t) => ({ id: t.id, text: t.reviewText })),
  };
}

// ──────────────────────────────────────────────────────────────
// REVIEW SELECTION TRACKING
// ──────────────────────────────────────────────────────────────

/**
 * Track which review the customer selected.
 * Immediately reserves the template in the database.
 */
export async function trackReviewSelection(userId, reviewGenerationId, selectedReview, templateId) {
  const record = await prisma.reviewGeneration.findUnique({
    where: { id: reviewGenerationId },
  });

  if (!record) throw new AppError('Review generation record not found', 404);
  if (record.userId !== userId) throw new AppError('Forbidden', 403);

  // 1. Perform reservation if templateId is provided and is a valid DB template
  if (templateId && !templateId.startsWith('fallback-')) {
    // Verify template is still AVAILABLE
    const template = await prisma.reviewTemplate.findUnique({
      where: { id: templateId },
    });

    if (template && template.status === 'AVAILABLE') {
      await prisma.reviewTemplate.update({
        where: { id: templateId },
        data: {
          status: 'RESERVED',
          reservedById: userId,
          reservedAt: new Date(),
        },
      });
    }
  }

  // 2. Update the ReviewGeneration session record with selected text and template ID
  await prisma.reviewGeneration.update({
    where: { id: reviewGenerationId },
    data: {
      selectedReview,
      reviewTemplateId: (templateId && !templateId.startsWith('fallback-')) ? templateId : null,
    },
  });
}

/**
 * Track when the customer clicks the "Open Google Reviews" button.
 * Immediately marks the reserved review template as USED.
 */
export async function trackReviewLinkClick(userId, reviewGenerationId) {
  const record = await prisma.reviewGeneration.findUnique({
    where: { id: reviewGenerationId },
  });

  if (!record) throw new AppError('Review generation record not found', 404);
  if (record.userId !== userId) throw new AppError('Forbidden', 403);

  // Mark the reserved template as USED
  if (record.reviewTemplateId) {
    await prisma.reviewTemplate.update({
      where: { id: record.reviewTemplateId },
      data: {
        status: 'USED',
        usedById: userId,
        usedAt: new Date(),
      },
    });
  }

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

  // Sync URLs to the main Business record for backwards compatibility
  const businessUpdateData = {};
  if (updateData.googleReviewUrl !== undefined) businessUpdateData.googleReviewUrl = updateData.googleReviewUrl;
  if (updateData.instagramUrl !== undefined) businessUpdateData.instagramUrl = updateData.instagramUrl;
  if (updateData.facebookUrl !== undefined) businessUpdateData.facebookUrl = updateData.facebookUrl;
  if (updateData.bookingUrl !== undefined) businessUpdateData.bookingUrl = updateData.bookingUrl;

  if (Object.keys(businessUpdateData).length > 0) {
    await prisma.business.update({
      where: { id: businessId },
      data: businessUpdateData,
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
