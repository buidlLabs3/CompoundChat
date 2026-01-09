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

  // Check if this is "withdraw earnings" command
  if (args[0]?.toLowerCase() === 'earnings') {
    return handleWithdrawEarnings(from, args.slice(1), wallet);
  }

  if (args.length < 2) {
    return `❌ Invalid format.\n\nUsage: *withdraw [amount] [token]*\nExample: withdraw 5 USDC\n\n💡 To withdraw earnings to your wallet:\nwithdraw earnings 5 USDC`;
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

  // Check if "to" keyword exists with address
  const toIndex = args.findIndex((a) => a.toLowerCase() === 'to');
  let externalAddress: string | null = null;
  
  if (toIndex >= 0 && args[toIndex + 1]) {
    externalAddress = args[toIndex + 1] || null;
    if (externalAddress && !ethers.isAddress(externalAddress)) {
      return '❌ Invalid destination address. Provide a valid Ethereum address (0x...).';
    }
  }

  // If no address provided (either no "to" or "to" without address), ask for it
  if (!externalAddress) {
    // Create session to wait for address
    setSession(from, {
      type: 'withdraw',
      amount,
      token,
      timestamp: Date.now(),
    });

    return `📤 *Withdraw from Compound*\n\nWithdrawing ${amount} ${token} from your earnings.\n\n*Where should I send it?*\n\nReply with:\n• Ethereum address (0x...)\n• Or type *my wallet* to keep in your wallet\n\n💡 *Tip:* Use *withdraw earnings ${amount} ${token}* to go directly to your wallet.\n\n⏱️ This request expires in 5 minutes.`;
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

      return `✅ *Withdrawal & Transfer Complete!*

💸 Withdrew from Compound: ${amount} ${token}
📤 Sent to: \`${externalAddress}\`

🔗 Transactions:
• Compound Withdraw: https://sepolia.etherscan.io/tx/${withdrawTxHash}
• On-chain Transfer: https://sepolia.etherscan.io/tx/${tx.hash}

Funds successfully sent to external wallet! ✨

Type *balance* to see your updated balance.`;
    }

    // Default: funds stay in wallet
    return `✅ *Withdrawal Successful!*

💸 Withdrew from Compound: ${amount} ${token}
💼 Now in your wallet!

🔗 Transaction:
https://sepolia.etherscan.io/tx/${withdrawTxHash}

💡 *Tip:* Use *send* to transfer to external wallets.
Example: send ${amount} ${token} to 0xabc...

Type *balance* to see your updated balance.`;
  } catch (error: any) {
    return `❌ Withdrawal failed: ${error.message}`;
  }
}

/**
 * Handle "withdraw earnings" command
 * Always withdraws from Compound to user's wallet (no external address)
 */
async function handleWithdrawEarnings(
  from: string,
  args: string[],
  wallet: any
): Promise<string> {
  if (args.length < 2) {
    return `❌ Invalid format.\n\nUsage: *withdraw earnings [amount] [token]*\nExample: withdraw earnings 1 USDC\n\nThis withdraws from Compound to YOUR wallet.`;
  }

  const amount = args[0];
  const token = args[1]?.toUpperCase() || '';

  if (!amount || !token) {
    return `❌ Invalid format.\n\nUsage: *withdraw earnings [amount] [token]*\nExample: withdraw earnings 1 USDC`;
  }

  const supported = Object.keys(SEPOLIA_TOKENS);
  const allowedBase = ['USDC'];
  if (!supported.includes(token)) {
    return `❌ Token ${token} not supported.\n\nSupported tokens: ${supported.join(', ')}`;
  }
  if (!allowedBase.includes(token)) {
    return `❌ Sepolia USDC market only accepts USDC.\n\nWithdraw base USDC.\nSupported: ${allowedBase.join(', ')}`;
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

    // Withdraw from Compound to user's wallet
    const result = await withdrawFromCompound(privateKey, token, amount);

    if (!isOk(result)) {
      return `❌ ${result.error.message}`;
    }

    const withdrawTxHash = result.value;

    return `✅ *Earnings Withdrawn!*

💰 Withdrew from Compound: ${amount} ${token}
💼 Funds now in your wallet!

🔗 Transaction:
https://sepolia.etherscan.io/tx/${withdrawTxHash}

You can now:
• Use *send ${amount} ${token} to 0xabc...* to transfer to external wallet
• Or *supply* to earn more interest

Type *balance* to see your updated balance.`;
  } catch (error: any) {
    return `❌ Withdrawal failed: ${error.message}`;
  }
}

