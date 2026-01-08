/**
 * Create wallet command handler
 */

import { createWallet } from '@wallet/creation';
import { database } from '@database/index';
import { encryptMnemonic } from '@encryption/e2ee';
import { isOk } from '@utils/result';

export async function handleCreateWallet(from: string): Promise<string> {
  // Check if user already has a wallet
  const existing = await database.getWallet(from);
  if (existing) {
    return `✅ You already have a wallet!

💼 Address: \`${existing.address}\`

📱 *Available Commands:*
• *my wallet* - View wallet details
• *balance* - Check your funds
• *markets* - View Compound markets
• *supply [amount] USDC* - Deposit to earn interest

⚠️ *Note:* You can only have ONE wallet per phone number. This keeps your funds safe.`;
  }

  // Create new wallet
  const result = await createWallet(from);

  if (!isOk(result)) {
    return `❌ Failed to create wallet: ${result.error.message}\n\nPlease try again later.`;
  }

  const { address, mnemonic, encryptedPrivateKey, salt, iv, authTag } = result.value;

  // Encrypt mnemonic for secure delivery
  const { passphrase } = encryptMnemonic(mnemonic);

  // Save to database
  await database.saveWallet(from, from, {
    address,
    encryptedPrivateKey,
    salt,
    iv,
    authTag,
  });

  return `✅ *Wallet Created Successfully!*

💼 Your Address:
\`${address}\`

🔐 *SAVE YOUR RECOVERY PHRASE:*
\`\`\`
${mnemonic}
\`\`\`

🔒 *Encrypted Backup:*
Passphrase: \`${passphrase}\`
(Use this to recover if you lose your phrase)

⚠️ *Security:*
• Write down the 24 words on paper
• Save the passphrase separately
• NEVER share with anyone
• CompoundChat can't recover lost phrases

📱 *Next Steps:*
1. Get Sepolia testnet USDC (faucet)
2. Type *balance* to check funds
3. Type *supply 10 USDC* to start earning

_Sepolia Testnet - Safe for Testing_ 🧪`;
}


