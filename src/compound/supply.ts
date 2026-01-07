/**
 * Compound V3 supply operations
 */

import { ethers } from 'ethers';
import { getProvider, getWallet } from './provider';
import {
  COMET_ABI,
  ERC20_ABI,
  COMPOUND_V3_SEPOLIA,
  SEPOLIA_TOKENS,
} from './contracts';
import { CompoundError } from '@utils/errors';
import { Result, Ok, Err } from '@utils/result';
import { logger, maskAddress } from '@utils/logger';

export async function supplyToCompound(
  privateKey: string,
  tokenSymbol: string,
  amount: string
): Promise<Result<string, CompoundError>> {
  // Sepolia Comet (USDC) only accepts USDC as base
  const allowedBaseTokens = ['USDC'];
  const tokenMap: Record<string, string> = {
    ...SEPOLIA_TOKENS,
    ETH: SEPOLIA_TOKENS.WETH,
  };
  const supportedTokens = Object.keys(tokenMap);

  try {
    const wallet = getWallet(privateKey);
    const provider = getProvider();

    // Normalize token and resolve address (using Sepolia for testing)
    const normalizedToken = tokenSymbol.toUpperCase();
    const tokenAddress = tokenMap[normalizedToken];
    if (!tokenAddress) {
      return Err(
        new CompoundError(
          'INVALID_TOKEN',
          `Token ${tokenSymbol} not supported. Supported: ${supportedTokens.join(', ')}`
        )
      );
    }

    // Enforce Comet base asset (USDC) on Sepolia
    if (!allowedBaseTokens.includes(normalizedToken)) {
      return Err(
        new CompoundError(
          'UNSUPPORTED_TOKEN',
          `Sepolia USDC market only accepts USDC. Swap ETH->USDC, then supply. Supported: ${allowedBaseTokens.join(', ')}`
        )
      );
    }

    // Special-case ETH: wrap to WETH then supply WETH to Comet
    let amountWei: bigint;
    let decimals: number;
    let tokenContract: ethers.Contract;

    // ERC20 path (USDC base)
    tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    decimals = await tokenContract['decimals']!();
    amountWei = ethers.parseUnits(amount, decimals);

    // Check balance
    const balance = await tokenContract['balanceOf']!(wallet.address);
    if (balance < amountWei) {
      return Err(
        new CompoundError(
          'INSUFFICIENT_BALANCE',
          `Insufficient ${normalizedToken}. You have ${ethers.formatUnits(balance, decimals)} but tried to supply ${amount}`
        )
      );
    }

    // Approve Comet to spend tokens
    const cometAddress = COMPOUND_V3_SEPOLIA.USDC_COMET;
    const tokenWithSigner = tokenContract.connect(wallet);

    const allowance = await tokenContract['allowance']!(wallet.address, cometAddress);
    if (allowance < amountWei) {
      logger.info('Approving Comet', { token: tokenSymbol, amount });
      const approveTx = await (tokenWithSigner as any).approve(cometAddress, amountWei);
      await approveTx.wait();
    }

    // Supply to Compound
    const cometContract = new ethers.Contract(cometAddress, COMET_ABI, wallet);
    logger.info('Supplying to Compound', {
      token: tokenSymbol,
      amount,
      address: maskAddress(wallet.address),
    });

    const tx = await cometContract['supply']!(tokenAddress, amountWei);
    const receipt = await tx.wait();

    logger.info('Supply successful', {
      txHash: receipt.hash,
      address: maskAddress(wallet.address),
    });

    return Ok(receipt.hash);
  } catch (error: any) {
    logger.error('Supply failed', { error: error.message });
    return Err(
      new CompoundError('SUPPLY_FAILED', `Supply failed: ${error.message}`)
    );
  }
}

