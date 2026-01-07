/**
 * WhatsApp Business API webhook handlers
 */

import { Router } from 'express';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { verifyWebhookSignature, rateLimiter } from './middleware';
import { handleMessage } from '@bot/index';

export const whatsappRouter = Router();

// Webhook verification (GET) - WhatsApp setup
whatsappRouter.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.webhookSecret) {
    logger.info('Webhook verified');
    res.status(200).send(challenge);
  } else {
    logger.warn('Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook handler (POST) - Receive messages
whatsappRouter.post(
  '/',
  rateLimiter,
  verifyWebhookSignature,
  async (req, res) => {
    // Acknowledge receipt immediately
    res.sendStatus(200);

    try {
      const body = req.body;

      if (body.object !== 'whatsapp_business_account') {
        logger.warn('Invalid webhook object', { object: body.object });
        return;
      }

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;

            if (value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              const from = message.from;
              const messageBody = message.text?.body || '';

              logger.info('Message received', {
                from,
                messageId: message.id,
              });

              // Handle message asynchronously
              await handleMessage(from, messageBody);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error processing webhook', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
);





