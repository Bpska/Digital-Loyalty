 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ── Console format (human-readable for dev) ──────────────────
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${_nullishCoalesce(stack, () => ( message))}${metaStr}`;
  })
);

// ── File format (JSON for structured log aggregation) ────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports = [
  new winston.transports.Console({ format: consoleFormat }),
];

if (env.NODE_ENV !== 'test') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(env.LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      format: fileFormat,
    }),
    new DailyRotateFile({
      filename: path.join(env.LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      format: fileFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  // Don't exit on unhandled errors from logger itself
  exitOnError: false,
});

/**
 * Morgan stream adapter — pipes HTTP access logs into Winston.
 */
export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};
