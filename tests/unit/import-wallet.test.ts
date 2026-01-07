import { importWalletFromMnemonic } from '../../src/wallet/creation';

describe('importWalletFromMnemonic', () => {
  const mnemonic =
    'test test test test test test test test test test test junk';

  it('imports a valid mnemonic and returns wallet data', async () => {
    const res = await importWalletFromMnemonic(mnemonic, 'user123');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.address).toMatch(/^0x/);
      expect(res.value.encryptedPrivateKey).toBeDefined();
      expect(res.value.authTag).toBeDefined();
    }
  });

  it('fails on invalid mnemonic', async () => {
    const res = await importWalletFromMnemonic('invalid words here', 'user123');
    expect(res.ok).toBe(false);
  });
});


