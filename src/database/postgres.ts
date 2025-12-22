/**
 * PostgreSQL database connection and operations
 */

import { Pool } from 'pg';
import { config } from '@config/index';
import { logger } from '@utils/logger';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.database.url,
      min: config.database.poolMin,
      max: config.database.poolMax,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected database error', { error: err });
    });

    logger.info('Database pool created');
  }

  return pool;
}

export interface UserWallet {
  id: string;
  phoneNumber: string;
  address: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
  authTag: string;
  createdAt: Date;
}

export const db = {
  async saveWallet(
    phoneNumber: string,
    whatsappId: string,
    wallet: {
      address: string;
      encryptedPrivateKey: string;
      salt: string;
      iv: string;
      authTag: string;
    }
  ): Promise<void> {
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert or get user
      const userResult = await client.query(
        `INSERT INTO users (phone_number, whatsapp_id) 
         VALUES ($1, $2) 
         ON CONFLICT (phone_number) DO UPDATE SET last_active_at = NOW()
         RETURNING id`,
        [phoneNumber, whatsappId]
      );
      const userId = userResult.rows[0]?.id;

      // Insert wallet
      await client.query(
        `INSERT INTO wallets (user_id, ethereum_address, encrypted_private_key, encryption_salt, encryption_iv, auth_tag)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, wallet.address, wallet.encryptedPrivateKey, wallet.salt, wallet.iv, wallet.authTag]
      );

      await client.query('COMMIT');
      logger.info('Wallet saved to database', { phoneNumber });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to save wallet', { error });
      throw error;
    } finally {
      client.release();
    }
  },

  async getWallet(phoneNumber: string): Promise<UserWallet | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT w.id, u.phone_number, w.ethereum_address as address, 
              w.encrypted_private_key, w.encryption_salt as salt, 
              w.encryption_iv as iv, w.auth_tag, w.created_at
       FROM wallets w
       JOIN users u ON w.user_id = u.id
       WHERE u.phone_number = $1`,
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      address: row.address,
      encryptedPrivateKey: row.encrypted_private_key,
      salt: row.salt,
      iv: row.iv,
      authTag: row.auth_tag,
      createdAt: row.created_at,
    };
  },

  async hasWallet(phoneNumber: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT 1 FROM wallets w
       JOIN users u ON w.user_id = u.id
       WHERE u.phone_number = $1`,
      [phoneNumber]
    );
    return result.rows.length > 0;
  },

  async saveTransaction(
    phoneNumber: string,
    tx: {
      txHash: string;
      type: string;
      token: string;
      amount: string;
      walletAddress: string;
    }
  ): Promise<void> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT u.id FROM users u WHERE u.phone_number = $1`,
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      return;
    }

    const userId = result.rows[0].id;

    await pool.query(
      `INSERT INTO transactions (user_id, wallet_address, tx_hash, tx_type, token, amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, tx.walletAddress, tx.txHash, tx.type, tx.token, tx.amount, 'pending']
    );

    logger.info('Transaction saved', { txHash: tx.txHash });
  },
};

