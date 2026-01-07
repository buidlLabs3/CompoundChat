/**
 * Deposit helper: show wallet address and quick links
 */

import { database } from '@database/index';
import { maskAddress } from '@utils/logger';

const SEPOLIA_CHAIN_ID = 11155111;

export async function handleDeposit(from: string): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  const address = wallet.address;
  const metamaskLink = `https://metamask.app.link/send/0x0000000000000000000000000000000000000000@${SEPOLIA_CHAIN_ID}/transfer?address=${address}&value=0`;

  return `💸 *Deposit Funds*\n\n` +
    `Send ETH, WETH, or USDC on Sepolia to your wallet:\n` +
    `\\\n\`${address}\`\n\n` +
    `🔗 Quick link (MetaMask mobile):\n${metamaskLink}\n\n` +
    `ℹ️ After funding, type *balance* then *supply [amount] [token]* to start earning.`;
}


