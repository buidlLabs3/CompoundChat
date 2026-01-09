/**
 * Send command handler - Send tokens from wallet to external address
 * Does NOT interact with Compound, just wallet-to-wallet transfers
 */

import { ethers } from 'ethers';
import { database } from '@database/index';
import { decryptPrivateKey } from '@wallet/encryption';
import { SEPOLIA_TOKENS, ERC20_ABI } from '@compound/contracts';
import { getProvider, getWallet } from '@compound/provider';
import { setSession } from '@bot/session-manager';

export async function handleSend(from: string, args: string[]): Promise<string> {
  const wallet = await database.getWallet(from);

  if (!wallet) {
    return `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
  }

  if (args.length < 2) {
    return `❌ Invalid format.\n\nUsage: *send [amount] [token]*\nExample: send 0.01 ETH\n\n💡 To send to a specific address:\nsend 0.01 ETH to 0xabc...`;
  }

  const amount = args[0];
  const token = args[1]?.toUpperCase() || '';

  if (!amount || !token) {
    return `❌ Invalid format.\n\nUsage: *send [amount] [token]*\nExample: send 0.01 ETH`;
  }

  // Check if token is supported (ETH or any token in SEPOLIA_TOKENS)
  const supportedTokens = ['ETH', ...Object.keys(SEPOLIA_TOKENS)];
  if (!supportedTokens.includes(token)) {
    return `❌ Token ${token} not supported.\n\nSupported tokens: ${supportedTokens.join(', ')}`;
  }

  // Check if "to" keyword exists
  const toIndex = args.findIndex((a) => a.toLowerCase() === 'to');

  // If user said "to" but didn't provide address, ask for it
  if (toIndex >= 0 && !args[toIndex + 1]) {
    // Create session to wait for address
    setSession(from, {
      type: 'send',
      amount,
      token,
      timestamp: Date.now(),
    });

    return `📤 *Send ${token}*\n\nYou're sending ${amount} ${token} from your wallet.\n\n*Where should I send it?*\n\nReply with:\n• Ethereum address (0x...)\n• Or type *cancel* to abort\n\n⏱️ This request expires in 5 minutes.`;
  }

  // Optional external address
  let externalAddress: string | null = null;
  if (toIndex >= 0 && args[toIndex + 1]) {
    externalAddress = args[toIndex + 1] || null;
    if (externalAddress && !ethers.isAddress(externalAddress)) {
      return '❌ Invalid destination address. Provide a valid Ethereum address (0x...).';
    }
  }

  // If no address provided, ask for it
  if (!externalAddress) {
    setSession(from, {
      type: 'send',
      amount,
      token,
      timestamp: Date.now(),
    });

    return `📤 *Send ${token}*\n\nYou're sending ${amount} ${token} from your wallet.\n\n*Where should I send it?*\n\nReply with an Ethereum address (0x...)\n\n⏱️ This request expires in 5 minutes.`;
  }

  // Execute the send
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
        return `❌ Insufficient ETH.\n\nYou have ${ethers.formatEther(balance)} ETH but tried to send ${amount} ETH`;
      }

      const tx = await signer.sendTransaction({
        to: externalAddress,
        value: amountWei,
      });

      await tx.wait();

      return `✅ *ETH Sent Successfully!*

💸 Sent: ${amount} ETH
📤 To: \`${externalAddress.slice(0, 6)}...${externalAddress.slice(-4)}\`

🔗 Transaction:
https://sepolia.etherscan.io/tx/${tx.hash}

Type *balance* to see your updated balance.`;
    } else {
      // Send ERC20 token
      const tokenAddress = SEPOLIA_TOKENS[token as keyof typeof SEPOLIA_TOKENS];
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract['decimals']!();
      const amountWei = ethers.parseUnits(amount, decimals);

      const balance = await tokenContract['balanceOf']!(wallet.address);
      if (balance < amountWei) {
        return `❌ Insufficient ${token}.\n\nYou have ${ethers.formatUnits(balance, decimals)} ${token} but tried to send ${amount} ${token}`;
      }

      const tx = await (tokenContract as any).transfer(externalAddress, amountWei);
      await tx.wait();

      return `✅ *${token} Sent Successfully!*

💸 Sent: ${amount} ${token}
📤 To: \`${externalAddress.slice(0, 6)}...${externalAddress.slice(-4)}\`

🔗 Transaction:
https://sepolia.etherscan.io/tx/${tx.hash}

Type *balance* to see your updated balance.`;
    }
  } catch (error: any) {
    return `❌ Send failed: ${error.message}`;
  }
}

