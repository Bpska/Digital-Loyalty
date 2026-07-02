import { env } from '../../config/env.js';

/**
 * OllamaService
 * Connects to the locally running Ollama instance.
 * Builds a prompt, sends it to the model, and returns 5 review suggestions.
 */

const STAR_LABELS = {
  1: '1 Star',
  2: '2 Stars',
  3: '3 Stars',
  4: '4 Stars',
  5: '5 Stars',
};

/**
 * Build the prompt string sent to the model.
 */
function buildPrompt(businessType, rating) {
  const stars = STAR_LABELS[rating] || `${rating} Stars`;
  return `Generate 5 realistic, highly SEO-friendly Google review suggestions for a business.
  
Business Type: ${businessType || 'Business'}
Rating: ${stars}

SEO Guidelines:
- Automatically incorporate high-traffic, category-specific local search keywords related to ${businessType || 'Business'} (e.g. service quality, menu/services, hygiene, price, ambience, staff behaviour, location).
- Maintain 100% organic, natural sounding human language. Do not make keyword placement feel stuffed or spammy.
- Write 1-2 short, impactful sentences per review.
- Provide diverse sentence structures and different word choices across all 5 reviews.
- Maximum 30 words per review. Suitable for Google Maps/Local Business ranking.

Return ONLY a JSON array of 5 strings. No markdown, no explanations, no numbering, no extra text. Example:
["Review 1 content.", "Review 2 content.", "Review 3 content.", "Review 4 content.", "Review 5 content."]`;
}

/**
 * Fallback reviews used when Ollama is unreachable.
 */
function getFallbackReviews(rating) {
  const reviews = {
    5: [
      'Absolutely fantastic experience! The staff were incredibly welcoming and professional.',
      'One of the best visits I have had. Highly recommend this place to everyone.',
      'Exceptional service and a wonderful atmosphere. Will definitely be coming back.',
      'Everything was perfect from start to finish. A truly outstanding experience.',
      'Amazing place with top-notch service. Could not have asked for more.',
    ],
    4: [
      'Really great experience overall. The team was friendly and the service was excellent.',
      'Very good visit, would recommend to friends and family without hesitation.',
      'Impressed with the quality and professionalism. A solid four-star experience.',
      'Enjoyed my time here. Service was smooth and the ambiance was pleasant.',
      'Great spot, well worth visiting. Minor improvements would make it perfect.',
    ],
    3: [
      'Decent experience, nothing extraordinary but met expectations for the most part.',
      'Average visit overall. Service was okay and the place was clean enough.',
      'Not bad, not great. A fair experience that I might repeat on a quiet day.',
      'Satisfactory visit. A few things could be improved but generally acceptable.',
      'Mediocre experience. Some positives, but a few things fell short of expectations.',
    ],
    2: [
      'Disappointing visit. Service was slow and the quality did not match expectations.',
      'Below average experience. A few improvements are urgently needed here.',
      'Expected better based on the reviews. Service needs significant improvement.',
      'Not up to standard. Staff seemed disinterested and the wait was too long.',
      'Underwhelming experience. Would need considerable changes before returning.',
    ],
    1: [
      'Very poor experience. Staff were rude and the service was unacceptably slow.',
      'Worst visit I have had in a long time. Would not recommend to anyone.',
      'Extremely disappointed. Nothing went right during this visit.',
      'Terrible experience from start to finish. Serious improvements needed.',
      'Could not believe how bad the service was. Will not be returning.',
    ],
  };
  return reviews[rating] || reviews[3];
}

/**
 * Call the Ollama REST API and extract the text response.
 */
async function callOllama(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  const response = await fetch(`${env.OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.8,
        top_p: 0.9,
        num_predict: 512,
      },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`Ollama HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data.response || '';
}

/**
 * Parse the text response from Ollama into a string array.
 * Handles cases where the model wraps the JSON in markdown code fences.
 */
function parseReviewsFromResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // Try to extract a JSON array directly
  const match = cleaned.match(/\[[\s\S]*?\]/);
  if (match) {
    const parsed = JSON.parse(match[0]);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((r) => String(r).trim())
        .filter(Boolean)
        .slice(0, 5);
    }
  }

  throw new Error('Could not parse review array from model response');
}

/**
 * Generate 5 review suggestions using the local Ollama instance.
 * Falls back to pre-written reviews on any error.
 *
 * @param {string} businessType - e.g. "Cafe"
 * @param {number} rating       - 1 to 5
 * @returns {Promise<string[]>} - Array of 5 review strings
 */
export async function generateReviews(businessType, rating) {
  const prompt = buildPrompt(businessType, rating);

  try {
    const raw = await callOllama(prompt);
    const reviews = parseReviewsFromResponse(raw);

    // Pad to 5 if model returned fewer
    while (reviews.length < 5) {
      const fallbacks = getFallbackReviews(rating);
      reviews.push(fallbacks[reviews.length] || fallbacks[0]);
    }

    return reviews;
  } catch (err) {
    console.warn('[OllamaService] Falling back to preset reviews. Reason:', err.message);
    return getFallbackReviews(rating);
  }
}
