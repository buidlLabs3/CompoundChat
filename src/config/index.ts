/**
 * Application configuration
 * Load and validate environment variables
 */

import dotenv from 'dotenv';
import { logger } from '@utils/logger';

dotenv.config();

interface Config {
  // Application
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  logLevel: string;

  // WhatsApp
  whatsapp: {
    apiKey: string;
    webhookSecret: string;
    phoneNumberId: string;
    businessAccountId: string;
  };

  // Ethereum
  ethereum: {
    rpcUrl: string;
    rpcFallback: string;
    sepoliaRpcUrl: string;
    chainId: number;
  };

  // Compound V3
  compound: {
    cometUsdc: string;
    cometEth: string;
  };

  // Database
  database: {
    url: string;
    poolMin: number;
    poolMax: number;
  };

  // Redis
  redis: {
    url: string;
    password?: string;
    tls: boolean;
  };

  // Security
  security: {
    masterEncryptionKey: string;
    jwtSecret: string;
    awsKmsKeyId?: string;
    awsRegion?: string;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    globalMax: number;
  };

  // Monitoring
  monitoring: {
    sentryDsn?: string;
  };

  // Transaction
  transaction: {
    gasLimitBuffer: number;
    maxGasPriceGwei: number;
    timeoutMs: number;
  };

  // Testing
  testing: {
    testWalletPrivateKey?: string;
    testUserPhone?: string;
  };
}

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

function getEnvVarFloat(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseFloat(value) : defaultValue;
}

function getEnvVarBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

const nodeEnv = (process.env['NODE_ENV'] as Config['nodeEnv']) || 'development';
const isTestEnv = nodeEnv === 'test';

export const config: Config = {
  nodeEnv,
  port: getEnvVarNumber('PORT', 3000),
  logLevel: getEnvVar('LOG_LEVEL', false) || 'info',

  whatsapp: {
    apiKey: getEnvVar('WHATSAPP_API_KEY', !isTestEnv),
    webhookSecret: getEnvVar('WHATSAPP_WEBHOOK_SECRET', !isTestEnv),
    phoneNumberId: getEnvVar('WHATSAPP_PHONE_NUMBER_ID', !isTestEnv),
    businessAccountId: getEnvVar('WHATSAPP_BUSINESS_ACCOUNT_ID', !isTestEnv),
  },

  ethereum: {
    rpcUrl: getEnvVar('ETHEREUM_RPC_URL', !isTestEnv),
    rpcFallback: getEnvVar('ETHEREUM_RPC_FALLBACK', false),
    sepoliaRpcUrl: getEnvVar('SEPOLIA_RPC_URL', false),
    chainId: getEnvVarNumber('CHAIN_ID', 1),
  },

  compound: {
    cometUsdc: getEnvVar(
      'COMPOUND_COMET_USDC',
      false
    ) || '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
    cometEth: getEnvVar(
      'COMPOUND_COMET_ETH',
      false
    ) || '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
  },

  database: {
    url: getEnvVar('DATABASE_URL'),
    poolMin: getEnvVarNumber('DATABASE_POOL_MIN', 2),
    poolMax: getEnvVarNumber('DATABASE_POOL_MAX', 10),
  },

  redis: {
    url: getEnvVar('REDIS_URL'),
    password: getEnvVar('REDIS_PASSWORD', false),
    tls: getEnvVarBoolean('REDIS_TLS', false),
  },

  security: {
    masterEncryptionKey: getEnvVar('MASTER_ENCRYPTION_KEY'),
    jwtSecret: getEnvVar('JWT_SECRET'),
    awsKmsKeyId: getEnvVar('AWS_KMS_KEY_ID', false),
    awsRegion: getEnvVar('AWS_REGION', false) || 'us-east-1',
  },

  rateLimit: {
    windowMs: getEnvVarNumber('RATE_LIMIT_WINDOW_MS', 60000),
    maxRequests: getEnvVarNumber('RATE_LIMIT_MAX_REQUESTS', 10),
    globalMax: getEnvVarNumber('RATE_LIMIT_GLOBAL_MAX', 1000),
  },

  monitoring: {
    sentryDsn: getEnvVar('SENTRY_DSN', false),
  },

  transaction: {
    gasLimitBuffer: getEnvVarFloat('GAS_LIMIT_BUFFER', 1.2),
    maxGasPriceGwei: getEnvVarNumber('MAX_GAS_PRICE_GWEI', 150),
    timeoutMs: getEnvVarNumber('TRANSACTION_TIMEOUT_MS', 120000),
  },

  testing: {
    testWalletPrivateKey: getEnvVar('TEST_WALLET_PRIVATE_KEY', false),
    testUserPhone: getEnvVar('TEST_USER_PHONE', false),
  },
};

// Validate critical config on startup
if (config.nodeEnv !== 'test') {
  if (config.security.masterEncryptionKey.length < 32) {
    throw new Error('MASTER_ENCRYPTION_KEY must be at least 32 characters');
  }
  if (config.security.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
}

logger.info('Configuration loaded', {
  nodeEnv: config.nodeEnv,
  port: config.port,
  chainId: config.ethereum.chainId,
});

export default config;

