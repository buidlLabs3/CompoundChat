/**
 * Withdraw command handler
 */

import { ethers } from 'ethers';
import { database } from '@database/index';
import { decryptPrivateKey } from '@wallet/encryption';
import { withdrawFromCompound } from '@compound/withdraw';
import { SEPOLIA_TOKENS, ERC20_ABI } from '@compound/contracts';
import { isOk } from '@utils/result';
import { getWallet } from '@compound/provider';
import { CompoundError } from '@utils/errors';
import { setSession } from '@bot/session-manager';

export async function handleWithdraw(from: string, args: string[]): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  if (args.length < 2) {
    return `❌ Invalid format.\n\nUsage: *withdraw [amount] [token]*\nExample: withdraw 5 USDC\n\n💡 You can also send to another wallet:\nwithdraw 5 USDC to 0xabc...`;
  }

  const amount = args[0];
  const token = args[1]?.toUpperCase() || '';

  if (!amount || !token) {
    return `❌ Invalid format.\n\nUsage: *withdraw [amount] [token]*\nExample: withdraw 5 USDC`;
  }

  const supported = Object.keys(SEPOLIA_TOKENS);
  const allowedBase = ['USDC'];
  if (!supported.includes(token)) {
    return `❌ Token ${token} not supported.\n\nSupported tokens: ${supported.join(', ')}`;
  }
  if (!allowedBase.includes(token)) {
    return `❌ Sepolia USDC market only accepts USDC.\n\nWithdraw base USDC, or swap to ETH after receiving.\nSupported: ${allowedBase.join(', ')}`;
  }

  // Check if "to" keyword exists
  const toIndex = args.findIndex((a) => a.toLowerCase() === 'to');
  
  // If user said "to" but didn't provide address, ask for it
  if (toIndex >= 0 && !args[toIndex + 1]) {
    // Create session to wait for address
    setSession(from, {
      type: 'withdraw',
      amount,
      token,
      timestamp: Date.now(),
    });

    return `📤 *External Withdrawal*\n\nYou're withdrawing ${amount} ${token} from Compound.\n\n*Where should I send it?*\n\nReply with:\n• Ethereum address (0x...)\n• Or type *my wallet* to send to your CompoundChat wallet\n\n⏱️ This request expires in 5 minutes.`;
  }

  // Optional external address
  let externalAddress: string | null = null;
  if (toIndex >= 0 && args[toIndex + 1]) {
    externalAddress = args[toIndex + 1] || null;
    if (externalAddress && !ethers.isAddress(externalAddress)) {
      return '❌ Invalid destination address. Provide a valid Ethereum address (0x...).';
    }
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

    const withdrawTxHash = result.value;

    // If external transfer requested, send USDC to target
    if (externalAddress && externalAddress.toLowerCase() !== wallet.address.toLowerCase()) {
      const signer = getWallet(privateKey);
      const tokenAddress = SEPOLIA_TOKENS[token as keyof typeof SEPOLIA_TOKENS];
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract['decimals']!();
      const amountWei = ethers.parseUnits(amount, decimals);

      const bal = await tokenContract['balanceOf']!(wallet.address);
      if (bal < amountWei) {
        throw new CompoundError(
          'INSUFFICIENT_BALANCE',
          `Not enough USDC in wallet to forward externally (have ${ethers.formatUnits(bal, decimals)}, need ${amount})`
        );
      }

      const tx = await (tokenContract as any).transfer(externalAddress, amountWei);
      await tx.wait();

      return `✅ *Withdrawal Successful!*

💸 Withdrew: ${amount} ${token}
📤 Sent to: \`${externalAddress}\`

🔗 Transaction:
• Withdraw: https://sepolia.etherscan.io/tx/${withdrawTxHash}
• Transfer: https://sepolia.etherscan.io/tx/${tx.hash}

Funds sent on-chain to your address.

Type *balance* to see your updated balance.`;
    }

    // Default: funds stay in wallet
    return `✅ *Withdrawal Successful!*

💸 Withdrew: ${amount} ${token}

🔗 Transaction:
https://sepolia.etherscan.io/tx/${withdrawTxHash}

Funds are back in your wallet!

Type *balance* to see your updated balance.`;
  } catch (error: any) {
    return `❌ Withdrawal failed: ${error.message}`;
  }
}

