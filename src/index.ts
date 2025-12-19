/**
 * CompoundChat - Main Application Entry Point
 * WhatsApp bot for Compound V3 DeFi operations
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { whatsappRouter } from '@webhooks/whatsapp';
import { errorHandler } from '@webhooks/middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.nodeEnv === 'production' ? false : '*' }));

// Parse JSON with raw body for signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// WhatsApp webhook routes
app.use('/webhook', whatsappRouter);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info('CompoundChat server started', {
    port: PORT,
    env: config.nodeEnv,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

