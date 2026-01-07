/**
 * Database abstraction layer
 * Switches between PostgreSQL, file storage, and in-memory based on environment
 */

import { config } from '@config/index';
import { logger } from '@utils/logger';
import { memoryStore } from './memory-store';
import { fileStore } from './file-store';
import { db as postgresDb, UserWallet } from './postgres';

export type { UserWallet };

// Check if PostgreSQL is configured
const usePostgres = config.database.url && config.database.url.includes('postgresql');

if (usePostgres) {
  logger.info('Using PostgreSQL database');
} else {
  logger.info('Using file-based storage (data persists across restarts)');
}

export const database = usePostgres ? postgresDb : fileStore;

