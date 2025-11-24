/**
 * Structured logging using Winston
 * Never logs sensitive data (private keys, mnemonics, etc.)
 */

import winston from 'winston';

// Sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  'privateKey',
  'private_key',
  'mnemonic',
  'seedPhrase',
  'seed_phrase',
  'password',
  'secret',
  'apiKey',
  'api_key',
  'token',
  'authorization',
];

/**
 * Sanitize log data to remove sensitive information
 */
function sanitize(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Mask phone numbers for privacy
 * Example: +254712345678 -> +254***5678
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) {
    return '[REDACTED]';
  }
  const prefix = phone.slice(0, 4);
  const suffix = phone.slice(-4);
  return `${prefix}***${suffix}`;
}

/**
 * Mask Ethereum addresses
 * Example: 0x1234567890abcdef -> 0x1234...cdef
 */
export function maskAddress(address: string): string {
  if (!address || address.length < 10) {
    return '[INVALID]';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(sanitize(meta), null, 2)}`;
    }
    return msg;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console for development
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Wrap logger methods to automatically sanitize data
const sanitizedLogger = {
  info: (message: string, meta?: object) => {
    logger.info(message, sanitize(meta));
  },
  error: (message: string, meta?: object) => {
    logger.error(message, sanitize(meta));
  },
  warn: (message: string, meta?: object) => {
    logger.warn(message, sanitize(meta));
  },
  debug: (message: string, meta?: object) => {
    logger.debug(message, sanitize(meta));
  },
};

export { sanitizedLogger as logger };

