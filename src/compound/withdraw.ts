/**
 * Compound V3 withdraw operations
 */

import { ethers } from 'ethers';
import { getWallet } from './provider';
import { COMET_ABI, ERC20_ABI, COMPOUND_V3_SEPOLIA, SEPOLIA_TOKENS } from './contracts';
import { CompoundError } from '@utils/errors';
import { Result, Ok, Err } from '@utils/result';
import { logger, maskAddress } from '@utils/logger';

export async function withdrawFromCompound(
  privateKey: string,
  tokenSymbol: string,
  amount: string
): Promise<Result<string, CompoundError>> {
  try {
    const wallet = getWallet(privateKey);

    const tokenAddress = SEPOLIA_TOKENS[tokenSymbol as keyof typeof SEPOLIA_TOKENS];
    if (!tokenAddress) {
      return Err(
        new CompoundError('INVALID_TOKEN', `Token ${tokenSymbol} not supported`)
      );
    }

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const decimals = await tokenContract['decimals']!();
    const amountWei = ethers.parseUnits(amount, decimals);

    // Check Compound balance
    const cometAddress = COMPOUND_V3_SEPOLIA.USDC_COMET;
    const cometContract = new ethers.Contract(cometAddress, COMET_ABI, wallet);
    const suppliedBalance = await cometContract['balanceOf']!(wallet.address);

    if (suppliedBalance < amountWei) {
      return Err(
        new CompoundError(
          'INSUFFICIENT_BALANCE',
          `Insufficient ${tokenSymbol} on Compound. You have ${ethers.formatUnits(suppliedBalance, decimals)} but tried to withdraw ${amount}`
        )
      );
    }

    // Withdraw from Compound
    logger.info('Withdrawing from Compound', {
      token: tokenSymbol,
      amount,
      address: maskAddress(wallet.address),
    });

    const tx = await cometContract['withdraw']!(tokenAddress, amountWei);
    const receipt = await tx.wait();

    logger.info('Withdrawal successful', {
      txHash: receipt.hash,
      address: maskAddress(wallet.address),
    });

    return Ok(receipt.hash);
  } catch (error: any) {
    logger.error('Withdrawal failed', { error: error.message });
    return Err(
      new CompoundError('WITHDRAW_FAILED', `Withdrawal failed: ${error.message}`)
    );
  }
}

