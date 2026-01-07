/**
 * Unit tests for zero-knowledge proofs
 */

import { 
  createBalanceCommitment, 
  verifyBalanceProof,
  createRangeProof 
} from '../../src/encryption/zk-proofs';

describe('Balance Commitments', () => {
  it('should create valid commitment for balance', () => {
    const balance = BigInt(1000);
    const { commitment, salt } = createBalanceCommitment(balance);

    expect(commitment).toBeTruthy();
    expect(commitment).toHaveLength(64); // SHA256 hex
    expect(salt).toBeTruthy();
  });

  it('should produce same commitment with same salt', () => {
    const balance = BigInt(500);
    const { commitment: c1, salt } = createBalanceCommitment(balance);
    const { commitment: c2 } = createBalanceCommitment(balance, salt);

    expect(c1).toBe(c2);
  });

  it('should verify valid balance proof', () => {
    const balance = BigInt(1000);
    const minimum = BigInt(500);
    const { commitment, salt } = createBalanceCommitment(balance);

    const isValid = verifyBalanceProof(commitment, balance, salt, minimum);
    expect(isValid).toBe(true);
  });

  it('should reject proof with insufficient balance', () => {
    const balance = BigInt(300);
    const minimum = BigInt(500);
    const { commitment, salt } = createBalanceCommitment(balance);

    const isValid = verifyBalanceProof(commitment, balance, salt, minimum);
    expect(isValid).toBe(false);
  });

  it('should reject proof with wrong commitment', () => {
    const balance = BigInt(1000);
    const minimum = BigInt(500);
    const { salt } = createBalanceCommitment(balance);
    const fakeCommitment = 'a'.repeat(64);

    const isValid = verifyBalanceProof(fakeCommitment, balance, salt, minimum);
    expect(isValid).toBe(false);
  });
});

describe('Range Proofs', () => {
  it('should create valid range proof', () => {
    const value = BigInt(50);
    const min = BigInt(0);
    const max = BigInt(100);

    const { proof, isValid } = createRangeProof(value, min, max);

    expect(proof).toBeTruthy();
    expect(isValid).toBe(true);
  });

  it('should mark invalid range proof when value out of range', () => {
    const value = BigInt(150);
    const min = BigInt(0);
    const max = BigInt(100);

    const { isValid } = createRangeProof(value, min, max);
    expect(isValid).toBe(false);
  });
});




