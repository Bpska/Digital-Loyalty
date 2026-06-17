 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Prisma Client singleton.
 * In development, we reuse the instance across hot reloads to avoid
 * exhausting database connections.
 */






const createPrismaClient = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });
};

export const prisma =
  _nullishCoalesce(global.__prisma, () => ( createPrismaClient()));

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
