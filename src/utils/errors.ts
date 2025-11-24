/**
 * Custom error types for CompoundChat
 * All errors extend CompoundChatError for consistent error handling
 */

export class CompoundChatError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Wallet-related errors
 */
export class WalletError extends CompoundChatError {
  static readonly INVALID_MNEMONIC = 'INVALID_MNEMONIC';
  static readonly INVALID_PRIVATE_KEY = 'INVALID_PRIVATE_KEY';
  static readonly ENCRYPTION_FAILED = 'ENCRYPTION_FAILED';
  static readonly DECRYPTION_FAILED = 'DECRYPTION_FAILED';
  static readonly WALLET_NOT_FOUND = 'WALLET_NOT_FOUND';
  static readonly WALLET_ALREADY_EXISTS = 'WALLET_ALREADY_EXISTS';
  static readonly DERIVATION_FAILED = 'DERIVATION_FAILED';
}

/**
 * Compound protocol errors
 */
export class CompoundError extends CompoundChatError {
  static readonly SUPPLY_FAILED = 'SUPPLY_FAILED';
  static readonly WITHDRAW_FAILED = 'WITHDRAW_FAILED';
  static readonly BORROW_FAILED = 'BORROW_FAILED';
  static readonly REPAY_FAILED = 'REPAY_FAILED';
  static readonly INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE';
  static readonly INSUFFICIENT_COLLATERAL = 'INSUFFICIENT_COLLATERAL';
  static readonly MARKET_NOT_FOUND = 'MARKET_NOT_FOUND';
  static readonly INVALID_TOKEN = 'INVALID_TOKEN';
  static readonly LIQUIDATION_RISK = 'LIQUIDATION_RISK';
}

/**
 * Encryption and security errors
 */
export class EncryptionError extends CompoundChatError {
  static readonly KEY_GENERATION_FAILED = 'KEY_GENERATION_FAILED';
  static readonly ENCRYPTION_FAILED = 'ENCRYPTION_FAILED';
  static readonly DECRYPTION_FAILED = 'DECRYPTION_FAILED';
  static readonly INVALID_KEY = 'INVALID_KEY';
  static readonly INVALID_IV = 'INVALID_IV';
  static readonly AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';
}

/**
 * Webhook and API errors
 */
export class WebhookError extends CompoundChatError {
  static readonly INVALID_SIGNATURE = 'INVALID_SIGNATURE';
  static readonly RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED';
  static readonly INVALID_PAYLOAD = 'INVALID_PAYLOAD';
  static readonly WHATSAPP_API_ERROR = 'WHATSAPP_API_ERROR';
}

/**
 * Database errors
 */
export class DatabaseError extends CompoundChatError {
  static readonly CONNECTION_FAILED = 'CONNECTION_FAILED';
  static readonly QUERY_FAILED = 'QUERY_FAILED';
  static readonly TRANSACTION_FAILED = 'TRANSACTION_FAILED';
  static readonly CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION';
}

/**
 * Blockchain errors
 */
export class BlockchainError extends CompoundChatError {
  static readonly RPC_ERROR = 'RPC_ERROR';
  static readonly TRANSACTION_FAILED = 'TRANSACTION_FAILED';
  static readonly INSUFFICIENT_GAS = 'INSUFFICIENT_GAS';
  static readonly NETWORK_ERROR = 'NETWORK_ERROR';
  static readonly CONTRACT_ERROR = 'CONTRACT_ERROR';
}

/**
 * Validation errors
 */
export class ValidationError extends CompoundChatError {
  static readonly INVALID_INPUT = 'INVALID_INPUT';
  static readonly INVALID_ADDRESS = 'INVALID_ADDRESS';
  static readonly INVALID_AMOUNT = 'INVALID_AMOUNT';
  static readonly INVALID_TOKEN = 'INVALID_TOKEN';
}

