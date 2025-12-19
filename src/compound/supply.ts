/**
 * Compound V3 supply operations
 */

import { ethers } from 'ethers';
import { getProvider, getWallet } from './provider';
import { COMET_ABI, ERC20_ABI, COMPOUND_V3_SEPOLIA, SEPOLIA_TOKENS } from './contracts';
import { CompoundError } from '@utils/errors';
import { Result, Ok, Err } from '@utils/result';
import { logger, maskAddress } from '@utils/logger';

export async function supplyToCompound(
  privateKey: string,
  tokenSymbol: string,
  amount: string
): Promise<Result<string, CompoundError>> {
  try {
    const wallet = getWallet(privateKey);
    const provider = getProvider();

    // Get token address (using Sepolia for testing)
    const tokenAddress = SEPOLIA_TOKENS[tokenSymbol as keyof typeof SEPOLIA_TOKENS];
    if (!tokenAddress) {
      return Err(
        new CompoundError('INVALID_TOKEN', `Token ${tokenSymbol} not supported`)
      );
    }

    // Parse amount based on token decimals
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await tokenContract['decimals']!();
    const amountWei = ethers.parseUnits(amount, decimals);

    // Check balance
    const balance = await tokenContract['balanceOf']!(wallet.address);
    if (balance < amountWei) {
      return Err(
        new CompoundError(
          'INSUFFICIENT_BALANCE',
          `Insufficient ${tokenSymbol}. You have ${ethers.formatUnits(balance, decimals)} but tried to supply ${amount}`
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

