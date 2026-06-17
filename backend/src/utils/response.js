 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

/**
 * Standard API response envelope.
 * All endpoints must use these helpers to ensure consistent shape:
 * { success, data, message, errors, meta? }
 */









/**
 * Send a successful JSON response.
 */
export function sendSuccess(
  res,
  data,
  message = 'Success',
  statusCode = 200,
  meta
) {
  const body = { success: true, data, message };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Send a created (201) response.
 */
export function sendCreated(res, data, message = 'Created') {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send an error JSON response.
 */
export function sendError(
  res,
  message,
  statusCode = 400,
  errors
) {
  const body = { success: false, message };
  if (_optionalChain([errors, 'optionalAccess', _ => _.length])) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Shorthand helpers for common HTTP status codes.
 */
export const Responses = {
  unauthorized: (res, message = 'Unauthorized') =>
    sendError(res, message, 401),

  forbidden: (res, message = 'Forbidden') =>
    sendError(res, message, 403),

  notFound: (res, message = 'Resource not found') =>
    sendError(res, message, 404),

  conflict: (res, message = 'Conflict') =>
    sendError(res, message, 409),

  tooManyRequests: (res, message = 'Too many requests') =>
    sendError(res, message, 429),

  internalError: (res, message = 'Internal server error') =>
    sendError(res, message, 500),
};
