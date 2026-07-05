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
function buildPrompt(context, rating, lastReviews) {
  const { name, category, description, locality } = context;
  const stars = STAR_LABELS[rating] || `${rating} Stars`;

  let lastReviewsInstructions = "";
  if (lastReviews && lastReviews.length > 0) {
    lastReviewsInstructions = `\nCRITICAL: Do NOT reuse the sentence structures, phrasing, or patterns of these recently generated reviews for this business:
${lastReviews.map((r) => `- "${r}"`).join('\n')}
Vary the wording and structure from those to keep suggestions fresh.`;
  }

  return `Write a genuine-sounding, positive Google review for ${name}, a ${category} business located in ${locality || 'the local area'}, described as: ${description || 'No description available'}.

Naturally weave in the business name, the type of service/product it offers, and the locality — each mentioned once, blended smoothly into normal sentence flow (never listed or forced). Highlight 1-2 specific, believable aspects relevant to a ${category} business (e.g. quality, staff behavior, ambience, speed, cleanliness — pick what fits naturally).

Keep it 2-3 sentences, warm and positive in tone, written the way a real happy customer would casually type it — not overly polished or salesy. Avoid generic filler phrases like "great service" or "highly recommend" unless paired with a specific reason why. Do not keyword-stuff — the SEO value should come from natural mention of name, category, and locality, not repetition.

Business Context:
- Name: ${name}
- Category: ${category}
- Description: ${description || ''}
- Locality: ${locality || ''}
- Rating: ${stars}
${lastReviewsInstructions}

Return ONLY a JSON array of 3 strings. No markdown, no explanations, no numbering, no extra text. Example:
["Review 1 content.", "Review 2 content.", "Review 3 content."]`;
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
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
        .slice(0, 3);
    }
  }

  throw new Error('Could not parse review array from model response');
}

/**
/**
 * Generate 3 review suggestions using the local Ollama instance.
 * Falls back to pre-written reviews on any error.
 *
 * @param {object} context      - Business context ({ name, category, description, locality })
 * @param {number} rating       - 1 to 5
 * @param {string[]} lastReviews - Last 5 generated reviews for the business
 * @returns {Promise<string[]>} - Array of 3 review strings
 */
export async function generateReviews(context, rating, lastReviews) {
  const prompt = buildPrompt(context, rating, lastReviews);

  try {
    const raw = await callOllama(prompt);
    const reviews = parseReviewsFromResponse(raw);

    // Pad to 3 if model returned fewer
    while (reviews.length < 3) {
      const fallbacks = getFallbackReviews(rating);
      reviews.push(fallbacks[reviews.length] || fallbacks[0]);
    }

    return reviews;
  } catch (err) {
    console.warn('[OllamaService] Falling back to preset reviews. Reason:', err.message);
    return getFallbackReviews(rating).slice(0, 3);
  }
}
