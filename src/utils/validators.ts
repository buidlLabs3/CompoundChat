/**
 * Input validation utilities
 * Validates user inputs to prevent injection attacks and ensure data integrity
 */

import { ethers } from 'ethers';
import Joi from 'joi';
import { ValidationError } from './errors';

/**
 * Validate Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Validate Ethereum private key (32 bytes hex)
 */
export function isValidPrivateKey(privateKey: string): boolean {
  if (!privateKey.startsWith('0x')) {
    return false;
  }
  if (privateKey.length !== 66) {
    return false;
  }
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate BIP39 mnemonic phrase
 */
export function isValidMnemonic(mnemonic: string): boolean {
  try {
    ethers.Mnemonic.fromPhrase(mnemonic);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate amount (must be positive number)
 */
export function isValidAmount(amount: string): boolean {
  try {
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed > 0 && isFinite(parsed);
  } catch {
    return false;
  }
}

/**
 * Validate token symbol
 */
export function isValidTokenSymbol(token: string): boolean {
  const validTokens = ['USDC', 'USDT', 'DAI', 'ETH', 'WETH'];
  return validTokens.includes(token.toUpperCase());
}

/**
 * Validate phone number (international format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation for international format: +<country code><number>
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate user ID
 */
export function isValidUserId(userId: string): boolean {
  // UUID v4 format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

/**
 * Joi schemas for complex validation
 */
export const schemas = {
  walletCreation: Joi.object({
    userId: Joi.string().uuid().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+[1-9]\d{1,14}$/)
      .required(),
  }),

  supplyCommand: Joi.object({
    userId: Joi.string().uuid().required(),
    amount: Joi.string()
      .pattern(/^\d+(\.\d+)?$/)
      .required(),
    token: Joi.string()
      .valid('USDC', 'USDT', 'DAI', 'ETH', 'WETH')
      .required(),
  }),

  withdrawCommand: Joi.object({
    userId: Joi.string().uuid().required(),
    amount: Joi.string()
      .pattern(/^\d+(\.\d+)?$/)
      .required(),
    token: Joi.string()
      .valid('USDC', 'USDT', 'DAI', 'ETH', 'WETH')
      .required(),
  }),

  webhookPayload: Joi.object({
    object: Joi.string().required(),
    entry: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          changes: Joi.array().required(),
        })
      )
      .required(),
  }),
};

/**
 * Validate data against a Joi schema
 */
export function validate<T>(
  data: unknown,
  schema: Joi.Schema
): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new ValidationError(
      ValidationError.INVALID_INPUT,
      `Validation failed: ${error.message}`,
      { details: error.details }
    );
  }

  return value as T;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  // Remove potential SQL injection characters
  return input
    .replace(/[';\\]/g, '')
    .trim()
    .slice(0, 500); // Max length
}

/**
 * Parse amount to wei/smallest unit
 */
export function parseAmount(amount: string, decimals: number): bigint {
  try {
    return ethers.parseUnits(amount, decimals);
  } catch (error) {
    throw new ValidationError(
      ValidationError.INVALID_AMOUNT,
      `Invalid amount: ${amount}`,
      { error }
    );
  }
}

/**
 * Format amount from wei/smallest unit
 */
export function formatAmount(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

