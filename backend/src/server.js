import 'dotenv/config'; // Must be first — loads .env before any other imports
import { env } from './config/env.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';
import prisma from './config/prisma.js';
import fs from 'fs';
import path from 'path';

// ── Ensure required directories exist ────────────────────────
function ensureDirectories() {
  const dirs = [env.UPLOAD_DIR, env.LOG_DIR];
  dirs.forEach(dir => {
    const resolved = path.resolve(dir);
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
      logger.info(`Created directory: ${resolved}`);
    }
  });
}



// ── Graceful shutdown ─────────────────────────────────────────
function setupGracefulShutdown(server) {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { message: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    process.exit(1);
  });
}

// ── Bootstrap ─────────────────────────────────────────────────
async function bootstrap() {
  ensureDirectories();

  // Verify database connection before starting server
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established');
  } catch (err) {
    logger.error('❌ Failed to connect to database', { err });
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server started`, {
      port: env.PORT,
      env: env.NODE_ENV,
      docs: `${env.BACKEND_URL}/api/docs`,
      health: `${env.BACKEND_URL}/health`,
    });
  });

  setupGracefulShutdown(server);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
