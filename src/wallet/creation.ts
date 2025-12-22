/**
 * Non-custodial wallet creation using BIP39 + BIP44
 */

import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { encryptPrivateKey } from './encryption';
import { WalletError } from '@utils/errors';
import { Ok, Err, Result } from '@utils/result';
import { logger, maskAddress } from '@utils/logger';

export interface WalletData {
  address: string;
  mnemonic: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
  authTag: string;
}

/**
 * Create new HD wallet with BIP44 derivation path for Ethereum
 */
export async function createWallet(
  userId: string
): Promise<Result<WalletData, WalletError>> {
  try {
    // Generate 24-word mnemonic (256-bit entropy)
    const mnemonic = bip39.generateMnemonic(256);

    // Derive HD wallet using BIP44 path: m/44'/60'/0'/0/0
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");

    // Encrypt private key
    const encrypted = await encryptPrivateKey(wallet.privateKey, userId);

    logger.info('Wallet created', {
      userId,
      address: maskAddress(wallet.address),
    });

    return Ok({
      address: wallet.address,
      mnemonic,
      encryptedPrivateKey: encrypted.ciphertext,
      salt: encrypted.salt,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    });
  } catch (error) {
    logger.error('Wallet creation failed', { userId, error });
    return Err(
      new WalletError('DERIVATION_FAILED', 'Failed to create wallet', error)
    );
  }
}

/**
 * Import wallet from mnemonic
 */
export async function importWalletFromMnemonic(
  mnemonic: string,
  userId: string
): Promise<Result<WalletData, WalletError>> {
  try {
    if (!bip39.validateMnemonic(mnemonic)) {
      return Err(
        new WalletError('INVALID_MNEMONIC', 'Invalid mnemonic phrase')
      );
    }

    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");

    const encrypted = await encryptPrivateKey(wallet.privateKey, userId);

    return Ok({
      address: wallet.address,
      mnemonic,
      encryptedPrivateKey: encrypted.ciphertext,
      salt: encrypted.salt,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    });
  } catch (error) {
    return Err(
      new WalletError('DERIVATION_FAILED', 'Failed to import wallet', error)
    );
  }
}


