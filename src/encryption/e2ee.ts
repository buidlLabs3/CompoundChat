/**
 * End-to-end encryption for sensitive data (mnemonics)
 * Simple implementation - encrypts mnemonic before sending
 */

import crypto from 'crypto';
import { EncryptionError } from '@utils/errors';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Encrypt mnemonic with a simple passphrase
 * User gets: encrypted data + passphrase via separate messages
 */
export function encryptMnemonic(mnemonic: string): {
  encrypted: string;
  passphrase: string;
} {
  try {
    // Generate random passphrase (6 words for user to remember)
    const words = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
    const passphrase = Array.from({ length: 6 }, () => 
      words[Math.floor(Math.random() * words.length)]
    ).join('-');

    // Derive key from passphrase
    const key = crypto.scryptSync(passphrase, 'compoundchat', 32);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(mnemonic, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Combine iv + authTag + encrypted
    const combined = Buffer.concat([iv, authTag, encrypted]);

    return {
      encrypted: combined.toString('base64'),
      passphrase,
    };
  } catch (error) {
    throw new EncryptionError(
      EncryptionError.ENCRYPTION_FAILED,
      'Failed to encrypt mnemonic',
      error
    );
  }
}

/**
 * Decrypt mnemonic with passphrase
 * Used for wallet recovery
 */
export function decryptMnemonic(encrypted: string, passphrase: string): string {
  try {
    const combined = Buffer.from(encrypted, 'base64');

    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + 16);
    const ciphertext = combined.subarray(IV_LENGTH + 16);

    // Derive key from passphrase
    const key = crypto.scryptSync(passphrase, 'compoundchat', 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new EncryptionError(
      EncryptionError.DECRYPTION_FAILED,
      'Failed to decrypt mnemonic - wrong passphrase?',
      error
    );
  }
}




