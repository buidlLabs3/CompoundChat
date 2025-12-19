/**
 * Create wallet command handler
 */

import { createWallet } from '@wallet/creation';
import { memoryStore } from '@database/memory-store';
import { maskAddress } from '@utils/logger';
import { isOk } from '@utils/result';

export async function handleCreateWallet(from: string): Promise<string> {
  // Check if user already has a wallet
  const existing = await memoryStore.getWallet(from);
  if (existing) {
    return `You already have a wallet!\n\n💼 Address: \`${maskAddress(existing.address)}\`\n\nType *balance* to check your funds.`;
  }

  // Create new wallet
  const result = await createWallet(from);

  if (!isOk(result)) {
    return `❌ Failed to create wallet: ${result.error.message}\n\nPlease try again later.`;
  }

  const { address, mnemonic, encryptedPrivateKey, salt, iv } = result.value;

  // Save to database
  await memoryStore.saveWallet(from, {
    address,
    encryptedPrivateKey,
    salt,
    iv,
    authTag: '', // Added in encryption
  });

  return `✅ *Wallet Created Successfully!*

💼 Your Address:
\`${address}\`

🔐 *IMPORTANT - Save Your Recovery Phrase:*
\`\`\`
${mnemonic}
\`\`\`

⚠️ *Security Warning:*
• Write down these 24 words on paper
• NEVER share them with anyone
• Anyone with these words can access your funds
• CompoundChat will NEVER ask for your recovery phrase

📱 *Next Steps:*
1. Fund your wallet with testnet USDC
2. Type *balance* to check your funds
3. Type *supply 10 USDC* to start earning

_This wallet is on Sepolia testnet for testing_`;
}

