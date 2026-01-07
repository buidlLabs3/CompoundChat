/**
 * Unit tests for end-to-end encryption
 */

import { encryptMnemonic, decryptMnemonic } from '../../src/encryption/e2ee';

describe('Mnemonic E2EE', () => {
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  it('should encrypt mnemonic and generate passphrase', () => {
    const { encrypted, passphrase } = encryptMnemonic(testMnemonic);

    expect(encrypted).toBeTruthy();
    expect(passphrase).toBeTruthy();
    expect(passphrase.split('-')).toHaveLength(6);
  });

  it('should decrypt mnemonic with correct passphrase', () => {
    const { encrypted, passphrase } = encryptMnemonic(testMnemonic);
    const decrypted = decryptMnemonic(encrypted, passphrase);

    expect(decrypted).toBe(testMnemonic);
  });

  it('should fail decryption with wrong passphrase', () => {
    const { encrypted } = encryptMnemonic(testMnemonic);

    expect(() => {
      decryptMnemonic(encrypted, 'wrong-passphrase');
    }).toThrow();
  });

  it('should produce different encrypted data for same mnemonic', () => {
    const result1 = encryptMnemonic(testMnemonic);
    const result2 = encryptMnemonic(testMnemonic);

    expect(result1.encrypted).not.toBe(result2.encrypted);
    expect(result1.passphrase).not.toBe(result2.passphrase);
  });
});




