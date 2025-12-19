/**
 * Ethereum provider with fallback
 */

import { ethers } from 'ethers';
import { config } from '@config/index';
import { logger } from '@utils/logger';

let primaryProvider: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  // Use Sepolia for testing
  if (config.ethereum.sepoliaRpcUrl && config.nodeEnv !== 'production') {
    if (!primaryProvider) {
      primaryProvider = new ethers.JsonRpcProvider(config.ethereum.sepoliaRpcUrl);
      logger.info('Connected to Sepolia testnet');
    }
    return primaryProvider;
  }

  // Mainnet for production
  if (!primaryProvider) {
    primaryProvider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);
    logger.info('Connected to Ethereum mainnet');
  }

  return primaryProvider;
}

export function getWallet(privateKey: string): ethers.Wallet {
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

