 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

/**
 * Audit log middleware factory.
 * Creates an AuditLog entry after the response is sent (non-blocking).
 *
 * Usage: router.post('/...', authenticate, auditLog('ACTION_NAME', 'EntityType'), handler)
 *
 * @param action     - Audit action name (e.g. 'BUSINESS_CREATED', 'REWARD_REDEEMED')
 * @param entityType - The Prisma model name (e.g. 'Business', 'CustomerReward')
 * @param getEntityId - Optional function to extract entityId from req (default: req.params.id)
 */
export function auditLog(
  action,
  entityType,
  getEntityId
) {
  return (req, res, next) => {
    // Hook into response finish event (post-handler, non-blocking)
    res.on('finish', () => {
      // Only audit successful mutations (2xx responses)
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      const entityId =
        _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_optionalChain([getEntityId, 'optionalCall', _ => _(req, res)]), () => (
        req.params.id)), () => (
        req.params.businessId)), () => (
        req.params.branchId)), () => (
        'unknown'));

      const metadata = {
        method: req.method,
        path: req.path,
        body: sanitizeBody(req.body) ,
        params: req.params ,
        statusCode: res.statusCode,
      };

      prisma.auditLog
        .create({
          data: {
            action,
            entityType,
            entityId,
            metadata: metadata ,
            ipAddress: getClientIp(req),
            ...(_optionalChain([req, 'access', _2 => _2.user, 'optionalAccess', _3 => _3.sub]) ? { userId: req.user.sub } : {}),
          },
        })
        .catch(err => logger.error('AuditLog write failed', { err, action, entityType }));
    });

    next();
  };
}

/**
 * Write an audit log entry programmatically (from service layer).
 */
export async function writeAuditLog(params






) {
  try {
    const { userId, metadata, ...rest } = params;
    await prisma.auditLog.create({
      data: {
        ...rest,
        ...(userId ? { userId } : {}),
        ...(metadata ? { metadata: metadata  } : {}),
      },
    });
  } catch (err) {
    logger.error('AuditLog programmatic write failed', { err, ...params });
  }
}

// ── Helpers ───────────────────────────────────────────────────

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return {};
  const sensitive = new Set(['password', 'passwordHash', 'otpHash', 'token', 'secret']);
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, sensitive.has(k) ? '[REDACTED]' : v])
  );
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return _nullishCoalesce(req.socket.remoteAddress, () => ( 'unknown'));
}
