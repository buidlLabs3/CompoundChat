/**
 * Wallet info command handler
 */

import { database } from '@database/index';
import { maskAddress } from '@utils/logger';

export async function handleWalletInfo(from: string): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  return `🔐 *Your Wallet*

📍 Address:
\`${wallet.address}\`

💡 *Tip:* Copy this address to receive funds or view on Etherscan:
https://sepolia.etherscan.io/address/${wallet.address}

⚠️ *Keep your 24-word recovery phrase safe!* Never share it with anyone.`;
}

