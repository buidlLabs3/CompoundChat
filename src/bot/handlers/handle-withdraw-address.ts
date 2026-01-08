/**
 * Handler for external withdrawal address input
 * Called when user is in a withdraw session and provides an address
 */

import { ethers } from 'ethers';
import { database } from '@database/index';
import { decryptPrivateKey } from '@wallet/encryption';
import { withdrawFromCompound } from '@compound/withdraw';
import { SEPOLIA_TOKENS, ERC20_ABI } from '@compound/contracts';
import { isOk } from '@utils/result';
import { getWallet } from '@compound/provider';
import { CompoundError } from '@utils/errors';
import { clearSession } from '@bot/session-manager';
import type { WithdrawSession } from '@bot/session-manager';

export async function handleWithdrawAddress(
  from: string,
  address: string,
  session: WithdrawSession
): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    clearSession(from);
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  const { amount, token } = session;

  // Validate address
  if (!ethers.isAddress(address)) {
    return `❌ Invalid Ethereum address.\n\nPlease provide a valid address (0x...) or type *cancel* to stop.`;
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
      clearSession(from);
      return `❌ ${result.error.message}`;
    }

    const withdrawTxHash = result.value;

    // Send tokens to external address
    if (address.toLowerCase() !== wallet.address.toLowerCase()) {
      const signer = getWallet(privateKey);
      const tokenAddress = SEPOLIA_TOKENS[token as keyof typeof SEPOLIA_TOKENS];
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract['decimals']!();
      const amountWei = ethers.parseUnits(amount, decimals);

      const bal = await tokenContract['balanceOf']!(wallet.address);
      if (bal < amountWei) {
        clearSession(from);
        throw new CompoundError(
          'INSUFFICIENT_BALANCE',
          `Not enough ${token} in wallet to forward externally (have ${ethers.formatUnits(
            bal,
            decimals
          )}, need ${amount})`
        );
      }

      const tx = await (tokenContract as any).transfer(address, amountWei);
      await tx.wait();

      clearSession(from);

      return `✅ *Withdrawal & Transfer Successful!*

💸 Withdrew: ${amount} ${token}
📤 Sent to: \`${address.slice(0, 6)}...${address.slice(-4)}\`

🔗 Transactions:
• Compound Withdraw: https://sepolia.etherscan.io/tx/${withdrawTxHash}
• Transfer: https://sepolia.etherscan.io/tx/${tx.hash}

Funds sent on-chain! ✨

Type *balance* to see your updated balance.`;
    }

    // If address is same as user's wallet, just withdraw
    clearSession(from);

    return `✅ *Withdrawal Successful!*

💸 Withdrew: ${amount} ${token}

🔗 Transaction:
https://sepolia.etherscan.io/tx/${withdrawTxHash}

Funds are back in your wallet!

Type *balance* to see your updated balance.`;
  } catch (error: any) {
    clearSession(from);
    return `❌ Withdrawal failed: ${error.message}`;
  }
}

