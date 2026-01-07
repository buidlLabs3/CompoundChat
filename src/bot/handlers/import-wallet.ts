/**
 * Import wallet from mnemonic
 */

import { importWalletFromMnemonic } from '@wallet/creation';
import { database } from '@database/index';
import { encryptMnemonic } from '@encryption/e2ee';
import { maskAddress } from '@utils/logger';
import { isOk } from '@utils/result';

export async function handleImportWallet(
  from: string,
  args: string[]
): Promise<string> {
  const mnemonic = args.join(' ').trim();

  if (!mnemonic || mnemonic.split(/\s+/).length < 12) {
    return (
      '❌ Invalid mnemonic.\n\n' +
      'Usage: *import wallet [your 12/24-word phrase]*\n' +
      'Example: import wallet word1 word2 ...'
    );
  }

  // If wallet exists, prevent overwrite
  const existing = await database.getWallet(from);
  if (existing) {
    return (
      `✅ You already have a wallet.\n\n` +
      `💼 Address: \`${maskAddress(existing.address)}\`\n\n` +
      `If you need to switch wallets, contact support before overriding.`
    );
  }

  const result = await importWalletFromMnemonic(mnemonic, from);
  if (!isOk(result)) {
    return `❌ Failed to import wallet: ${result.error.message}`;
  }

  const { address, encryptedPrivateKey, salt, iv, authTag } = result.value;

  // Encrypt mnemonic for backup passphrase
  const { passphrase } = encryptMnemonic(mnemonic);

  await database.saveWallet(from, from, {
    address,
    encryptedPrivateKey,
    salt,
    iv,
    authTag,
  });

  return (
    `✅ *Wallet Imported Successfully!*\n\n` +
    `💼 Address:\n\`${address}\`\n\n` +
    `🔒 *Encrypted Backup Passphrase:*\n\`${passphrase}\`\n` +
    `(Use to recover if you lose your phrase)\n\n` +
    `⚠️ *Security:*\n` +
    `• Store your 12/24 words safely\n` +
    `• Never share with anyone\n\n` +
    `Next: type *balance* to check funds or *supply 1 USDC* to start earning.`
  );
}


