 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Prisma Client singleton.
 * In development, we reuse the instance across hot reloads to avoid
 * exhausting database connections.
 */






const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

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

  return client;
};

export const prisma =
  _nullishCoalesce(global.__prisma, () => ( createPrismaClient()));

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
