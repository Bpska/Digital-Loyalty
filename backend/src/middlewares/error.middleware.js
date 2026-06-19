 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

/**
 * Custom application error class.
 * Throw this from controllers/services to return structured HTTP errors.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, extra = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.extra = extra;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 handler — must be registered AFTER all routes.
 */
export function notFoundHandler(req, res) {
  sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
}

/**
 * Global error handler — must be registered AFTER all routes and middleware.
 * Handles AppError (operational), Prisma errors, and unexpected errors.
 */
export function globalErrorHandler(
  err,
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next
) {
  // ── AppError (intentionally thrown by application code) ──
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('AppError (server)', { message: err.message, stack: err.stack, path: req.path });
    } else {
      logger.warn('AppError (client)', { message: err.message, statusCode: err.statusCode });
    }
    sendError(res, err.message, err.statusCode, null, err.extra);
    return;
  }

  // ── Prisma known errors ───────────────────────────────────
  if (isPrismaError(err)) {
    const { message, statusCode } = handlePrismaError(err );
    logger.warn('Prisma error', { code: (err ).code, message });
    sendError(res, message, statusCode);
    return;
  }

  // ── JWT errors (from jsonwebtoken) ───────────────────────
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }
  if (err instanceof Error && err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // ── Multer errors ─────────────────────────────────────────
  if (err instanceof Error && err.name === 'MulterError') {
    sendError(res, `File upload error: ${err.message}`, 400);
    return;
  }

  // ── Unknown / unexpected errors ──────────────────────────
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  logger.error('Unexpected error', {
    message,
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  sendError(
    res,
    env.NODE_ENV === 'production' ? `Internal server error: ${message}` : message,
    500
  );
}

// ── Prisma error helpers ──────────────────────────────────────







function isPrismaError(err) {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err ).code === 'string' &&
    (err ).code.startsWith('P')
  );
}

function handlePrismaError(err) {
  switch (err.code) {
    case 'P2002': {
      const field = _nullishCoalesce(_optionalChain([err, 'access', _ => _.meta, 'optionalAccess', _2 => _2.target, 'optionalAccess', _3 => _3.join, 'call', _4 => _4(', ')]), () => ( 'field'));
      return { message: `Unique constraint violation: ${field} already exists`, statusCode: 409 };
    }
    case 'P2025':
      return { message: 'Record not found', statusCode: 404 };
    case 'P2003':
      return { message: 'Related record not found', statusCode: 400 };
    case 'P2014':
      return { message: 'Required relation violated', statusCode: 400 };
    default:
      return { message: `Database error: ${err.message}`, statusCode: 500 };
  }
}
