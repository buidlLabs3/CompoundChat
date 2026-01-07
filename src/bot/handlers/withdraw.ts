/**
 * Withdraw command handler
 */

import { database } from '@database/index';
import { decryptPrivateKey } from '@wallet/encryption';
import { withdrawFromCompound } from '@compound/withdraw';
import { SEPOLIA_TOKENS } from '@compound/contracts';
import { isOk } from '@utils/result';

export async function handleWithdraw(from: string, args: string[]): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  if (args.length < 2) {
    return `❌ Invalid format.\n\nUsage: *withdraw [amount] [token]*\nExample: withdraw 50 USDC`;
  }

  const amount = args[0];
  const token = args[1]?.toUpperCase() || '';

  if (!amount || !token) {
    return `❌ Invalid format.\n\nUsage: *withdraw [amount] [token]*\nExample: withdraw 0.005 ETH`;
  }

  const supported = Object.keys(SEPOLIA_TOKENS);
  if (!supported.includes(token)) {
    return `❌ Token ${token} not supported.\n\nSupported tokens: ${supported.join(', ')}`;
  }

  try {
    // Decrypt private key
    if (!wallet.authTag) {
      throw new Error('Wallet data corrupted');
    }
    
    const privateKey = await decryptPrivateKey(
      {
        ciphertext: wallet.encryptedPrivateKey,
        iv: wallet.iv,
        salt: wallet.salt,
        authTag: wallet.authTag,
      },
      from
    );

    // Withdraw from Compound
    const result = await withdrawFromCompound(privateKey, token, amount);

    if (!isOk(result)) {
      return `❌ ${result.error.message}`;
    }

    const txHash = result.value;
    return `✅ *Withdrawal Successful!*

💸 Withdrew: ${amount} ${token}

🔗 Transaction:
https://sepolia.etherscan.io/tx/${txHash}

Funds are back in your wallet!

Type *balance* to see your updated balance.`;
  } catch (error: any) {
    return `❌ Withdrawal failed: ${error.message}`;
  }
}

