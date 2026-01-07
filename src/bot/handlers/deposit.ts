/**
 * Deposit helper: show wallet address and quick links
 */

import { database } from '@database/index';
import { maskAddress } from '@utils/logger';
import { SEPOLIA_TOKENS } from '@compound/contracts';

const SEPOLIA_CHAIN_ID = 11155111;

export async function handleDeposit(from: string): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  const address = wallet.address;
  const ethLink = `https://metamask.app.link/send/0x0000000000000000000000000000000000000000@${SEPOLIA_CHAIN_ID}/transfer?address=${address}&value=0`;
  const usdc = SEPOLIA_TOKENS.USDC;
  const usdcLink = `https://metamask.app.link/send/${usdc}@${SEPOLIA_CHAIN_ID}/transfer?address=${address}&value=0`;

  return `💸 *Deposit Funds*\n\n` +
    `Send ETH, WETH, or USDC on Sepolia to your wallet:\n` +
    `\\\n\`${address}\`\n\n` +
    `🔗 Quick links (MetaMask mobile):\n` +
    `• ETH: ${ethLink}\n` +
    `• USDC: ${usdcLink}\n\n` +
    `ℹ️ After funding, type *balance* then *supply [amount] USDC* to start earning.`;
}


