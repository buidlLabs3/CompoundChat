/**
 * Handler for send address input
 * Called when user is in a send session and provides an address
 */

import { ethers } from 'ethers';
import { database } from '@database/index';
import { decryptPrivateKey } from '@wallet/encryption';
import { SEPOLIA_TOKENS, ERC20_ABI } from '@compound/contracts';
import { getProvider, getWallet } from '@compound/provider';
import { clearSession } from '@bot/session-manager';
import type { SendSession } from '@bot/session-manager';

export async function handleSendAddress(
  from: string,
  address: string,
  session: SendSession
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

    const provider = getProvider();
    const signer = getWallet(privateKey);

    if (token === 'ETH') {
      // Send ETH
      const amountWei = ethers.parseEther(amount);
      const balance = await provider.getBalance(wallet.address);

      if (balance < amountWei) {
        clearSession(from);
        return `❌ Insufficient ETH.\n\nYou have ${ethers.formatEther(balance)} ETH but tried to send ${amount} ETH`;
      }

      const tx = await signer.sendTransaction({
        to: address,
        value: amountWei,
      });

      await tx.wait();
      clearSession(from);

      return `✅ *ETH Sent Successfully!*

💸 Sent: ${amount} ETH
📤 To: \`${address.slice(0, 6)}...${address.slice(-4)}\`

🔗 Transaction:
https://sepolia.etherscan.io/tx/${tx.hash}

Funds sent on-chain! ✨

Type *balance* to see your updated balance.`;
    } else {
      // Send ERC20 token
      const tokenAddress = SEPOLIA_TOKENS[token as keyof typeof SEPOLIA_TOKENS];
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract['decimals']!();
      const amountWei = ethers.parseUnits(amount, decimals);

      const balance = await tokenContract['balanceOf']!(wallet.address);
      if (balance < amountWei) {
        clearSession(from);
        return `❌ Insufficient ${token}.\n\nYou have ${ethers.formatUnits(balance, decimals)} ${token} but tried to send ${amount} ${token}`;
      }

      const tx = await (tokenContract as any).transfer(address, amountWei);
      await tx.wait();
      clearSession(from);

      return `✅ *${token} Sent Successfully!*

💸 Sent: ${amount} ${token}
📤 To: \`${address.slice(0, 6)}...${address.slice(-4)}\`

🔗 Transaction:
https://sepolia.etherscan.io/tx/${tx.hash}

Funds sent on-chain! ✨

Type *balance* to see your updated balance.`;
    }
  } catch (error: any) {
    clearSession(from);
    return `❌ Send failed: ${error.message}`;
  }
}

