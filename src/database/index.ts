/**
 * Database abstraction layer
 * Switches between PostgreSQL and in-memory based on environment
 */

import { config } from '@config/index';
import { logger } from '@utils/logger';
import { memoryStore } from './memory-store';
import { db as postgresDb, UserWallet } from './postgres';

export type { UserWallet };

// Check if PostgreSQL is configured
const usePostgres = config.database.url && config.database.url.includes('postgresql');

if (usePostgres) {
  logger.info('Using PostgreSQL database');
} else {
  logger.warn('Using in-memory storage (data will be lost on restart)');
}

export const database = usePostgres ? postgresDb : memoryStore;

