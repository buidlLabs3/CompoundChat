/**
 * Simple in-memory storage for MVP
 * TODO: Replace with PostgreSQL in production
 */

interface UserWallet {
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
  async saveWallet(phoneNumber: string, wallet: Omit<UserWallet, 'phoneNumber' | 'createdAt'>): Promise<void> {
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
};

