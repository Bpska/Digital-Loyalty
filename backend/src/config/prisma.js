 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Prisma Client singleton.
 * In development, we reuse the instance across hot reloads to avoid
 * exhausting database connections.
 *
 * CONNECTION POOL STRATEGY:
 * ─────────────────────────
 * Prisma opens a pool of DB connections per PrismaClient instance.
 * Default = num_cpus * 2 + 1 (e.g. 9 on a 4-core machine).
 *
 * For production multi-instance deployments:
 *   • We cap the pool size via `connection_limit` in the DATABASE_URL
 *     OR via the `datasources.db.url` override here.
 *   • A connection pooler (PgBouncer) should sit between the app and
 *     PostgreSQL to multiplex connections across all instances.
 *
 * Environment variables used:
 *   DATABASE_URL           — primary connection string
 *   DATABASE_POOL_URL      — (optional) pooler URL for PgBouncer
 *   PRISMA_CONNECTION_LIMIT — max pool size per instance (default: 5)
 *   PRISMA_POOL_TIMEOUT    — seconds to wait for a free connection (default: 10)
 */

const POOL_LIMIT = parseInt(process.env.PRISMA_CONNECTION_LIMIT || '5', 10);
const POOL_TIMEOUT = parseInt(process.env.PRISMA_POOL_TIMEOUT || '10', 10);

/**
 * Build the effective database URL with connection pool parameters.
 * If DATABASE_POOL_URL is set (e.g. pointing to PgBouncer), use it.
 * Otherwise, append pool parameters to the existing DATABASE_URL.
 */
function buildDatabaseUrl() {
  const baseUrl = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;
  if (!baseUrl) return process.env.DATABASE_URL;

  const url = new URL(baseUrl);

  // Set connection pool parameters if not already present
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', String(POOL_LIMIT));
  }
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', String(POOL_TIMEOUT));
  }

  // If using PgBouncer in transaction mode, Prisma needs pgbouncer=true
  // to disable prepared statements (PgBouncer can't handle them in txn mode)
  if (process.env.DATABASE_POOL_URL && !url.searchParams.has('pgbouncer')) {
    url.searchParams.set('pgbouncer', 'true');
  }

  return url.toString();
}

const createPrismaClient = () => {
  const effectiveUrl = buildDatabaseUrl();

  const client = new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    datasources: {
      db: {
        url: effectiveUrl,
      },
    },
  });

  // ── Connection pool health monitoring ──────────────────────
  if (env.NODE_ENV === 'production') {
    // Log pool metrics periodically (every 5 minutes)
    const METRICS_INTERVAL = 5 * 60 * 1000;
    setInterval(async () => {
      try {
        // Simple health check query
        await client.$queryRaw`SELECT 1`;
      } catch (err) {
        console.error('[Prisma Pool Health] Connection check failed:', err.message);
      }
    }, METRICS_INTERVAL).unref(); // .unref() so it doesn't prevent graceful shutdown
  }

  // ── Notification push trigger middleware ────────────────────
  client.$use(async (params, next) => {
    const result = await next(params);
    if (params.model === 'Notification' && params.action === 'create') {
      const data = params.args.data;
      if (data && data.userId) {
        import('../modules/notification/push.service.js')
          .then(m => m.sendPushToUser(data.userId, data.title, data.body))
          .catch(err => console.error('Push trigger error:', err));
      }
    }
    return result;
  });

  console.info(`[Prisma] Pool initialized: limit=${POOL_LIMIT}, timeout=${POOL_TIMEOUT}s, pgbouncer=${!!process.env.DATABASE_POOL_URL}`);

  return client;
};

export const prisma =
  _nullishCoalesce(global.__prisma, () => ( createPrismaClient()));

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
