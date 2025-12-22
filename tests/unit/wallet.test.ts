/**
 * Unit tests for wallet creation and encryption
 */

import { createWallet } from '../../src/wallet/creation';
import { encryptPrivateKey, decryptPrivateKey } from '../../src/wallet/encryption';
import { isOk } from '../../src/utils/result';

describe('Wallet Creation', () => {
  it('should create a valid wallet with 24-word mnemonic', async () => {
    const result = await createWallet('test-user-1');

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.mnemonic.split(' ')).toHaveLength(24);
      expect(result.value.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result.value.encryptedPrivateKey).toBeTruthy();
    }
  });

  it('should create different wallets for different users', async () => {
    const wallet1 = await createWallet('user-1');
    const wallet2 = await createWallet('user-2');

    expect(isOk(wallet1)).toBe(true);
    expect(isOk(wallet2)).toBe(true);

    if (isOk(wallet1) && isOk(wallet2)) {
      expect(wallet1.value.address).not.toBe(wallet2.value.address);
      expect(wallet1.value.mnemonic).not.toBe(wallet2.value.mnemonic);
    }
  });
});

describe('Private Key Encryption', () => {
  const testPrivateKey = '0x' + 'a'.repeat(64);
  const userId = 'test-user';

  it('should encrypt and decrypt private key successfully', async () => {
    const encrypted = await encryptPrivateKey(testPrivateKey, userId);

    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.salt).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.authTag).toBeTruthy();

    const decrypted = await decryptPrivateKey(encrypted, userId);
    expect(decrypted).toBe(testPrivateKey);
  });

  it('should produce different ciphertext for same input (unique IV)', async () => {
    const encrypted1 = await encryptPrivateKey(testPrivateKey, userId);
    const encrypted2 = await encryptPrivateKey(testPrivateKey, userId);

    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
  });

  it('should fail decryption with wrong user ID', async () => {
    const encrypted = await encryptPrivateKey(testPrivateKey, 'user-1');

    await expect(
      decryptPrivateKey(encrypted, 'user-2')
    ).rejects.toThrow();
  });
});

