

import { sendError } from '../utils/response.js';

/**
 * Zod schema validation middleware factory.
 * Validates req.body, req.params, or req.query against a Zod schema.
 * Returns a 422 with structured field errors on failure.
 *
 * @param schema  - Zod schema to validate against
 * @param source  - Which request property to validate ('body' | 'params' | 'query')
 */
export function validate(
  schema,
  source = 'body'
) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      sendError(res, 'Validation failed', 422, errors);
      return;
    }

    // Replace with parsed/coerced data (strips unknown keys via strict schemas)
    req[source] = result.data;
    next();
  };
}

/**
 * Validate multiple sources at once.
 */
export function validateAll(schemas



) {
  return (req, res, next) => {
    const allErrors = [];

    for (const [source, schema] of Object.entries(schemas) 


) {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        allErrors.push(...formatZodErrors(result.error));
      } else {
        req[source] = result.data;
      }
    }

    if (allErrors.length > 0) {
      sendError(res, 'Validation failed', 422, allErrors);
      return;
    }

    next();
  };
}

/**
 * Format Zod errors into human-readable strings: "field: message"
 */
function formatZodErrors(error) {
  return error.errors.map(e => {
    const path = e.path.join('.');
    return path ? `${path}: ${e.message}` : e.message;
  });
}
