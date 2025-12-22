/**
 * Jest test setup file
 * Runs before all tests
 */

// Set test environment
process.env['NODE_ENV'] = 'test';
process.env['LOG_LEVEL'] = 'error'; // Reduce noise in test output

// Mock environment variables for tests
process.env['MASTER_ENCRYPTION_KEY'] = 'test_master_key_32_characters_long_for_testing_purposes';
process.env['JWT_SECRET'] = 'test_jwt_secret_32_characters_long_for_testing';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/compoundchat_test';
process.env['REDIS_URL'] = 'redis://localhost:6379/1';

// Increase timeout for blockchain interactions
jest.setTimeout(30000);

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep error and warn for debugging
  error: console.error,
  warn: console.warn,
};

