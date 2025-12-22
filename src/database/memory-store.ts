/**
 * Simple in-memory storage for MVP
 * TODO: Replace with PostgreSQL in production
 */

export interface UserWallet {
  phoneNumber: string;
  address: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
  authTag: string;
  createdAt: number;
}

const walletsStore = new Map<string, UserWallet>();

export const memoryStore = {
  async saveWallet(
    phoneNumber: string,
    _whatsappId: string,
    wallet: Omit<UserWallet, 'phoneNumber' | 'createdAt'>
  ): Promise<void> {
    walletsStore.set(phoneNumber, {
      phoneNumber,
      ...wallet,
      createdAt: Date.now(),
    });
  },

  async getWallet(phoneNumber: string): Promise<UserWallet | null> {
    return walletsStore.get(phoneNumber) || null;
  },

  async hasWallet(phoneNumber: string): Promise<boolean> {
    return walletsStore.has(phoneNumber);
  },

  async deleteWallet(phoneNumber: string): Promise<void> {
    walletsStore.delete(phoneNumber);
  },

  async saveTransaction(
    _phoneNumber: string,
    _tx: {
      txHash: string;
      type: string;
      token: string;
      amount: string;
      walletAddress: string;
    }
  ): Promise<void> {
    // No-op for memory store
  },
};


