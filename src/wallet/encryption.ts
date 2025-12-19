/**
 * Private key encryption using AES-256-GCM
 */

import crypto from 'crypto';
import { config } from '@config/index';
import { EncryptionError } from '@utils/errors';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 32;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  authTag: string;
}

/**
 * Derive encryption key using HKDF
 */
function deriveKey(masterKey: string, salt: Buffer, userId: string): Buffer {
  const result = crypto.hkdfSync(
    'sha256',
    Buffer.from(masterKey, 'hex'),
    salt,
    Buffer.from(`compoundchat-wallet-v1-${userId}`),
    32
  );
  return Buffer.from(result);
}

/**
 * Encrypt private key with AES-256-GCM
 */
export async function encryptPrivateKey(
  privateKey: string,
  userId: string
): Promise<EncryptedData> {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive user-specific key
    const key = deriveKey(config.security.masterEncryptionKey, salt, userId);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
    const encrypted = Buffer.concat([
      cipher.update(privateKeyBuffer),
      cipher.final(),
    ]);

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
      ciphertext: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    throw new EncryptionError(
      EncryptionError.ENCRYPTION_FAILED,
      'Failed to encrypt private key',
      error
    );
  }
}

/**
 * Decrypt private key
 */
export async function decryptPrivateKey(
  encrypted: EncryptedData,
  userId: string
): Promise<string> {
  try {
    const salt = Buffer.from(encrypted.salt, 'hex');
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');
    const ciphertext = Buffer.from(encrypted.ciphertext, 'hex');

    // Derive same key
    const key = deriveKey(config.security.masterEncryptionKey, salt, userId);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return '0x' + decrypted.toString('hex');
  } catch (error) {
    throw new EncryptionError(
      EncryptionError.DECRYPTION_FAILED,
      'Failed to decrypt private key',
      error
    );
  }
}

