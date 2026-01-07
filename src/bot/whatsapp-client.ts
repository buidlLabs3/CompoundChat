/**
 * WhatsApp Business API client
 */

import axios from 'axios';
import { config } from '@config/index';
import { logger, maskPhoneNumber } from '@utils/logger';

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`;

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  try {
    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('Message sent', { to: maskPhoneNumber(to) });
  } catch (error) {
    logger.error('Failed to send WhatsApp message', {
      to: maskPhoneNumber(to),
      error,
    });
    throw error;
  }
}





