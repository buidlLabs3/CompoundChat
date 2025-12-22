/**
 * Supply command handler
 */

import { database } from '@database/index';
import { decryptPrivateKey } from '@wallet/encryption';
import { supplyToCompound } from '@compound/supply';
import { isOk } from '@utils/result';

export async function handleSupply(from: string, args: string[]): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  if (args.length < 2) {
    return `❌ Invalid format.\n\nUsage: *supply [amount] [token]*\nExample: supply 100 USDC`;
  }

  const amount = args[0];
  const token = args[1]?.toUpperCase() || '';

  if (!amount || !token) {
    return `❌ Invalid format.\n\nUsage: *supply [amount] [token]*\nExample: supply 100 USDC`;
  }

  if (!['USDC'].includes(token)) {
    return `❌ Token ${token} not supported yet.\n\nSupported tokens: USDC`;
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

    // Supply to Compound
    const result = await supplyToCompound(privateKey, token, amount);

    // Clear private key from memory
    (privateKey as any) = null;

    if (!isOk(result)) {
      return `❌ ${result.error.message}`;
    }

    const txHash = result.value;
    return `✅ *Supply Successful!*

💰 Deposited: ${amount} ${token}
📈 APY: ~4.2% (estimated)

🔗 Transaction:
https://sepolia.etherscan.io/tx/${txHash}

Your ${token} is now earning interest on Compound!

Type *balance* to see your updated balance.`;
  } catch (error: any) {
    return `❌ Supply failed: ${error.message}`;
  }
}

