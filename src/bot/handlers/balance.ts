/**
 * Balance command handler
 */

import { ethers } from 'ethers';
import { database } from '@database/index';
import { getProvider } from '@compound/provider';
import { COMET_ABI, ERC20_ABI, COMPOUND_V3_SEPOLIA, SEPOLIA_TOKENS } from '@compound/contracts';
import { maskAddress } from '@utils/logger';

export async function handleBalance(from: string): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  try {
    const provider = getProvider();
    
    // Get ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    const ethFormatted = ethers.formatEther(ethBalance);

    // Get USDC balance
    const usdcContract = new ethers.Contract(
      SEPOLIA_TOKENS.USDC,
      ERC20_ABI,
      provider
    );
    const usdcBalance = await usdcContract['balanceOf']!(wallet.address);
    const usdcFormatted = ethers.formatUnits(usdcBalance, 6);

    // Get Compound balance
    const cometContract = new ethers.Contract(
      COMPOUND_V3_SEPOLIA.USDC_COMET,
      COMET_ABI,
      provider
    );
    const compoundBalance = await cometContract['balanceOf']!(wallet.address);
    const compoundFormatted = ethers.formatUnits(compoundBalance, 6);

    let response = `💰 *Your Balance*\n\n`;
    response += `💼 Wallet: \`${maskAddress(wallet.address)}\`\n\n`;
    response += `*In Wallet:*\n`;
    response += `• ${parseFloat(ethFormatted).toFixed(4)} ETH\n`;
    response += `• ${parseFloat(usdcFormatted).toFixed(2)} USDC\n\n`;

    if (parseFloat(compoundFormatted) > 0) {
      response += `*On Compound (Earning):* 📈\n`;
      response += `• ${parseFloat(compoundFormatted).toFixed(2)} USDC\n`;
      response += `• APY: ~4.2% (estimated)\n\n`;
    }

    response += `_Sepolia Testnet_`;

    return response;
  } catch (error: any) {
    return `❌ Failed to fetch balance: ${error.message}`;
  }
}

