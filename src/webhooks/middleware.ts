/**
 * Webhook security middleware
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { WebhookError } from '@utils/errors';

// Rate limiting
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.globalMax,
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});

// Verify WhatsApp webhook signature
export function verifyWebhookSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers['x-hub-signature-256'] as string;

  if (!signature) {
    logger.warn('Missing webhook signature');
    res.sendStatus(401);
    return;
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    logger.error('Missing raw body for signature verification');
    res.sendStatus(500);
    return;
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.whatsapp.webhookSecret)
    .update(rawBody)
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');

  if (
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    )
  ) {
    logger.warn('Invalid webhook signature');
    res.sendStatus(401);
    return;
  }

  next();
}

// Global error handler
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });

  if (err instanceof WebhookError) {
    res.status(400).json({ error: err.code });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
}

