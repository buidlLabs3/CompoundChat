/**
 * File-based storage for wallet data
 * Stores wallets in a JSON file for persistence
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '@utils/logger';
import type { UserWallet } from './memory-store';

const DATA_DIR = path.join(process.cwd(), '.data');
const WALLETS_FILE = path.join(DATA_DIR, 'wallets.json');

interface WalletStore {
  wallets: Record<string, UserWallet>;
}

class FileStore {
  private wallets: Map<string, UserWallet> = new Map();
  private initialized = false;

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      logger.error('Failed to create data directory', { error });
    }
  }

  private async loadFromFile(): Promise<void> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(WALLETS_FILE, 'utf-8');
      const store: WalletStore = JSON.parse(data);
      
      this.wallets = new Map(Object.entries(store.wallets));
      logger.info('Loaded wallets from file', { count: this.wallets.size });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.info('No existing wallet file found, starting fresh');
        this.wallets = new Map();
      } else {
        logger.error('Failed to load wallets from file', { error });
        this.wallets = new Map();
      }
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      await this.ensureDataDir();
      const store: WalletStore = {
        wallets: Object.fromEntries(this.wallets.entries()),
      };
      await fs.writeFile(WALLETS_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Failed to save wallets to file', { error });
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.loadFromFile();
      this.initialized = true;
    }
  }

  async getWallet(userId: string): Promise<UserWallet | null> {
    await this.ensureInitialized();
    return this.wallets.get(userId) || null;
  }

  async saveWallet(userId: string, wallet: UserWallet): Promise<void> {
    await this.ensureInitialized();
    this.wallets.set(userId, wallet);
    await this.saveToFile();
  }

  async updateWallet(userId: string, updates: Partial<UserWallet>): Promise<void> {
    await this.ensureInitialized();
    const existing = this.wallets.get(userId);
    if (existing) {
      this.wallets.set(userId, { ...existing, ...updates });
      await this.saveToFile();
    }
  }

  async deleteWallet(userId: string): Promise<void> {
    await this.ensureInitialized();
    this.wallets.delete(userId);
    await this.saveToFile();
  }

  async getAllWallets(): Promise<UserWallet[]> {
    await this.ensureInitialized();
    return Array.from(this.wallets.values());
  }
}

export const fileStore = new FileStore();

