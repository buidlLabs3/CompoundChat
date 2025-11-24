# Milestone 1: Core Bot Development & Wallet Integration

**Budget**: $7,000 USD  
**Timeline**: Weeks 1-4 (4 weeks)  
**Status**: 🚧 In Progress

---

## Executive Summary

Milestone 1 establishes the foundational infrastructure for CompoundChat: a secure, non-custodial WhatsApp bot that enables users to interact with Compound V3 protocols through simple text commands. This milestone focuses on three critical pillars:

1. **Secure messaging infrastructure** - WhatsApp webhook integration with enterprise-grade security
2. **Non-custodial wallet system** - Battle-tested cryptography for key management
3. **Compound V3 integration** - Core DeFi operations (balance, supply, withdraw)

By the end of Week 4, we will have a working beta bot completing real transactions on Ethereum mainnet, tested by 30+ internal users across 3 African countries.

---

## Detailed Deliverables

### 1. Messaging Platform API Integration (Week 1)

#### Scope
Implement secure WhatsApp Business API integration with production-ready webhook infrastructure.

#### Technical Requirements

**WhatsApp Business API Setup**
- Register business account and get API credentials
- Configure webhook endpoint for incoming messages
- Implement message sending capabilities
- Handle media messages (for QR codes, tutorials)
- Support message templates for notifications

**Webhook Security**
```typescript
// Required security measures:
- Webhook signature verification (HMAC-SHA256)
- HTTPS-only endpoints with TLS 1.3+
- Rate limiting (10 req/min per user, 1000 req/min global)
- DDoS protection via CloudFlare/AWS Shield
- Request size limits (max 10KB payload)
- Replay attack prevention (timestamp validation)
- IP allowlisting for WhatsApp servers
```

**Infrastructure Components**
- Express.js server with TypeScript
- Redis for session management (user conversation state)
- PostgreSQL for persistent data
- Webhook health monitoring endpoint
- Graceful shutdown handling
- Request/response logging (sanitized)

**Message Flow**
```
User sends message via WhatsApp
    ↓
WhatsApp API → Webhook Endpoint
    ↓
Signature verification
    ↓
Rate limit check
    ↓
Parse message intent
    ↓
Route to command handler
    ↓
Execute command logic
    ↓
Format response
    ↓
Send via WhatsApp API
    ↓
Log transaction
```

#### Deliverables Checklist
- [ ] WhatsApp Business API account configured
- [ ] Webhook server deployed with HTTPS
- [ ] Signature verification implemented and tested
- [ ] Rate limiting active (Redis-based)
- [ ] Message parsing and routing logic
- [ ] Session management system
- [ ] Health check endpoint (`/health`)
- [ ] Monitoring dashboard (uptime, request volume, errors)
- [ ] Documentation: Webhook API reference

#### Testing Criteria
- Webhook accepts and validates 100 consecutive messages
- Signature verification blocks 100% of invalid requests
- Rate limiter correctly throttles excess requests
- Server maintains 99.9% uptime during 24hr stress test
- Average webhook response time <200ms

---

### 2. Non-Custodial Wallet Creation & Management (Week 2)

#### Scope
Build cryptographically secure, non-custodial wallet system where users maintain full control of private keys.

#### Technical Requirements

**Wallet Creation Flow**
```typescript
User: "Create wallet"
    ↓
1. Generate 24-word BIP39 mnemonic (256-bit entropy)
2. Derive HD wallet using BIP44 path: m/44'/60'/0'/0/0
3. Extract Ethereum address and private key
4. Encrypt private key with user-specific key (AES-256-GCM)
5. Store encrypted key in database
6. Send mnemonic to user via E2E encrypted message
7. Confirm user has backed up mnemonic
8. Delete mnemonic from server (never stored)
```

**Cryptographic Specifications**
- **Entropy**: 256 bits (24 words) using cryptographically secure RNG
- **Key Derivation**: BIP44 Ethereum path: `m/44'/60'/0'/0/0`
- **Encryption**: AES-256-GCM with per-user key derived from:
  - User phone number (salted and hashed)
  - Server master key (stored in AWS KMS / HashiCorp Vault)
  - Random salt (stored with encrypted key)
- **No plaintext keys**: Private keys never stored or logged unencrypted

**Wallet Import**
Support importing existing wallets via:
- 12/24-word mnemonic phrase
- Private key (hex format)
- Compatible with MetaMask, Trust Wallet, Rabby exports

**Key Management Database Schema**
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  ethereum_address VARCHAR(42) NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  encryption_salt VARCHAR(64) NOT NULL,
  encryption_iv VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP,
  derivation_path VARCHAR(50) DEFAULT 'm/44''/60''/0''/0/0',
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(ethereum_address);
```

**Security Measures**
- Private keys encrypted at rest (AES-256-GCM)
- Master encryption key stored in KMS, never in code/env files
- Per-user salt prevents rainbow table attacks
- Constant-time comparison for sensitive operations
- Private keys only decrypted in memory for transaction signing
- Memory cleared after signing (zero out buffers)
- No key material in logs (even debug logs)
- Automated security scanning (Snyk, Dependabot)

**Recovery System**
- User receives mnemonic exactly once via encrypted WhatsApp message
- Server never stores mnemonic phrase
- Recovery flow: User sends mnemonic → Wallet re-derived → Address verified
- Support for changing encryption password (re-encrypt private key)

#### Deliverables Checklist
- [ ] BIP39 mnemonic generation (256-bit)
- [ ] BIP44 HD wallet derivation for Ethereum
- [ ] AES-256-GCM encryption implementation
- [ ] Database schema with encrypted key storage
- [ ] Wallet creation command handler
- [ ] Wallet import functionality (mnemonic + private key)
- [ ] Recovery flow implementation
- [ ] Unit tests (100% coverage on crypto functions)
- [ ] Integration tests (wallet creation → encryption → decryption → signing)
- [ ] Security review documentation
- [ ] Key management procedures documented

#### Testing Criteria
- Generate 1000 wallets, all unique and valid Ethereum addresses
- Encrypt/decrypt private key 1000 times, 100% success rate
- Verify BIP44 derivation matches MetaMask output
- Recovery flow works for 100% of test wallets
- No private keys appear in logs during 1000 operation test
- Memory leak test: Create 10,000 wallets, memory stable

---

### 3. Basic Command Structure (Weeks 2-3)

#### Scope
Implement core bot commands for DeFi interactions with intuitive UX.

#### Commands

**Command: `help`**
```
Purpose: Guide new users, explain available commands
Response:
---
👋 Welcome to CompoundChat!

Earn interest on your crypto with Compound:

📊 balance - Check your wallet & earnings
💰 supply - Deposit crypto to earn interest
💸 withdraw - Take out your money
📈 markets - See all lending markets
❓ help - Show this message

Need to get started?
📱 Type "create wallet" to begin

Questions? Reply anytime!
---
```

**Command: `balance`**
```
Purpose: Show wallet balances and lending positions
Requirements:
- Fetch Ethereum address balance
- Query Compound V3 for supplied assets
- Calculate current APY and accrued interest
- Display in user-friendly format

Response:
---
💰 Your Balance

Wallet: 0x1234...5678
ETH: 0.15 ($450.00)

📈 Earning on Compound:
USDC: 1,000.00 (4.2% APY)
Interest earned: $12.50

Total value: $1,462.50
---
```

**Command: `supply [amount] [token]`**
```
Purpose: Deposit assets to Compound to earn interest
Example: "supply 100 USDC"
Requirements:
- Parse amount and token from message
- Validate user has sufficient balance
- Check token is supported by Compound V3
- Execute supply transaction
- Send confirmation with transaction hash

Response:
---
✅ Supply Successful!

Deposited: 100 USDC
APY: 4.2%
Daily earnings: ~$0.012

Transaction: 0xabc...xyz
View: etherscan.io/tx/0xabc...xyz

Your USDC is now earning interest! 📈
---
```

**Command: `withdraw [amount] [token]`**
```
Purpose: Withdraw supplied assets from Compound
Example: "withdraw 50 USDC"
Requirements:
- Verify user has supplied assets
- Check withdrawal doesn't trigger liquidation (if borrowed)
- Execute withdrawal transaction
- Send confirmation

Response:
---
✅ Withdrawal Successful!

Withdrew: 50 USDC
Remaining: 50 USDC still earning 4.2%

Transaction: 0xdef...uvw
View: etherscan.io/tx/0xdef...uvw

Funds are back in your wallet! 💸
---
```

**Command: `markets`**
```
Purpose: Show all available Compound V3 markets
Requirements:
- Fetch current APYs from Compound contracts
- Display supported assets
- Show total market size

Response:
---
📈 Compound Markets

Earn interest on:
💵 USDC - 4.2% APY
💵 USDT - 3.8% APY
💎 ETH - 2.1% APY
💰 DAI - 3.9% APY

To supply: "supply [amount] [token]"
Example: "supply 100 USDC"
---
```

#### Command Parser Implementation
```typescript
interface ParsedCommand {
  action: 'balance' | 'supply' | 'withdraw' | 'markets' | 'help' | 'unknown';
  amount?: bigint;
  token?: string;
  raw: string;
}

// Handle natural language variations:
"balance" | "bal" | "check balance" | "my balance" → balance
"supply 100 usdc" | "deposit 100 usdc" | "lend 100 usdc" → supply
"withdraw 50 usdc" | "take out 50 usdc" | "get 50 usdc" → withdraw
```

#### Error Handling
```typescript
// Every error must be user-friendly:

❌ "Insufficient balance" 
✅ "You don't have enough USDC. Your balance is 50 USDC, but you tried to supply 100 USDC."

❌ "Revert: execution error"
✅ "Transaction failed. This usually means you don't have enough ETH for gas fees. Try adding more ETH to your wallet."

❌ "Invalid token address"
✅ "We don't support that token yet. Try: USDC, USDT, ETH, or DAI"
```

#### Deliverables Checklist
- [ ] Command parser with natural language support
- [ ] `help` command handler
- [ ] `balance` command handler
- [ ] `supply` command handler
- [ ] `withdraw` command handler
- [ ] `markets` command handler
- [ ] Error messages in simple English
- [ ] Input validation for all commands
- [ ] Unit tests for all command handlers
- [ ] Integration tests for complete command flows

#### Testing Criteria
- Parser correctly identifies 100 command variations
- All commands respond within 2 seconds (balance/markets) or 30 seconds (supply/withdraw)
- Error handling covers 20 common failure scenarios
- Messages are grade 8 reading level or below

---

### 4. Compound V3 Contract Integration (Week 3)

#### Scope
Connect bot to Compound V3 (Comet) contracts on Ethereum mainnet for lending operations.

#### Technical Requirements

**Compound V3 Overview**
- **Comet**: Compound V3 contract (per base asset)
- **Base Assets**: USDC, ETH (separate Comet instances)
- **Collateral Assets**: Various ERC20s
- **Operations**: Supply, withdraw, borrow, repay

**Contract Addresses (Ethereum Mainnet)**
```typescript
const COMPOUND_V3_ADDRESSES = {
  USDC_COMET: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
  ETH_COMET: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
  CONFIGURATOR: '0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3'
};
```

**ABIs Required**
- Comet.sol (supply, withdraw, balanceOf, getSupplyRate)
- CometCore.sol (base tracking)
- ERC20 (approve, transfer, balanceOf)

**Supply Operation Flow**
```typescript
// 1. Check user wallet balance
const balance = await tokenContract.balanceOf(userAddress);
if (balance < amount) throw new InsufficientBalanceError();

// 2. Approve Comet to spend tokens
const approveTx = await tokenContract.approve(COMET_ADDRESS, amount);
await approveTx.wait();

// 3. Supply to Compound
const supplyTx = await cometContract.supply(tokenAddress, amount);
const receipt = await supplyTx.wait();

// 4. Verify supply was successful
const newBalance = await cometContract.balanceOf(userAddress);
```

**Withdraw Operation Flow**
```typescript
// 1. Check supplied balance on Compound
const suppliedBalance = await cometContract.balanceOf(userAddress);
if (suppliedBalance < amount) throw new InsufficientSupplyError();

// 2. Check if withdrawal would cause liquidation (if user has borrows)
const borrowBalance = await cometContract.borrowBalanceOf(userAddress);
if (borrowBalance > 0) {
  const healthFactor = calculateHealthFactor(suppliedBalance - amount, borrowBalance);
  if (healthFactor < 1.1) throw new LiquidationRiskError();
}

// 3. Withdraw from Compound
const withdrawTx = await cometContract.withdraw(tokenAddress, amount);
const receipt = await withdrawTx.wait();
```

**Market Data Fetching**
```typescript
// Get current supply APY
const utilization = await cometContract.getUtilization();
const supplyRate = await cometContract.getSupplyRate(utilization);
const supplyApy = supplyRate * SECONDS_PER_YEAR / 1e18 * 100;

// Get total market size
const totalSupply = await cometContract.totalSupply();
const totalBorrow = await cometContract.totalBorrow();
```

**Gas Optimization**
- Use `estimateGas()` before transactions
- Set gas limit to estimated * 1.2 (20% buffer)
- Monitor gas prices, warn user if >100 gwei
- Implement transaction queuing for high gas periods

**RPC Providers**
- Primary: Alchemy
- Fallback: Infura
- Automatic failover if primary is down
- Health checks every 60 seconds
- Circuit breaker pattern (5 failures → switch provider)

#### Deliverables Checklist
- [ ] Compound V3 contract ABIs integrated
- [ ] Comet contract connection (USDC + ETH markets)
- [ ] Supply function implementation
- [ ] Withdraw function implementation
- [ ] Balance checking (wallet + Compound positions)
- [ ] Market data fetching (APYs, TVL)
- [ ] Gas estimation and optimization
- [ ] RPC provider fallback system
- [ ] Transaction status tracking
- [ ] Integration tests on Sepolia testnet
- [ ] Mainnet integration tests (small amounts)

#### Testing Criteria
- Successfully supply $10 USDC on mainnet (test wallet)
- Successfully withdraw $10 USDC on mainnet
- Balance queries match Compound UI exactly
- APY calculations accurate to 0.01%
- RPC failover works when primary provider is offline
- Gas estimation within 10% of actual gas used

---

### 5. End-to-End Encryption (Week 4)

#### Scope
Implement E2EE for sensitive operations (wallet creation, transaction signing).

#### Technical Requirements

**Encryption Scheme**
```typescript
// For sensitive data (mnemonics, private keys):
Algorithm: AES-256-GCM
Key derivation: HKDF-SHA256
Key source: 
  - User phone number (salted)
  - Server master key (KMS)
  - Random salt per-user
IV: 128-bit random (unique per encryption)
Authentication tag: Verified on decryption
```

**Key Exchange Protocol**
For future multi-device support:
- Elliptic Curve Diffie-Hellman (ECDH) using Curve25519
- Signal Protocol double ratchet for forward secrecy
- Out-of-band verification (QR code scanning)

**Encrypted Message Flow**
```
User requests wallet creation
    ↓
Generate mnemonic
    ↓
Encrypt mnemonic with user-specific key
    ↓
Send encrypted message via WhatsApp
    ↓
User receives and decrypts locally (future: client-side app)
    ↓
Server deletes mnemonic from memory
```

**Security Properties**
- **Confidentiality**: Only user can decrypt their data
- **Integrity**: Tampering detected via GCM auth tag
- **Forward secrecy**: Compromised key doesn't reveal past data
- **No key reuse**: Unique IV for every encryption

#### Deliverables Checklist
- [ ] AES-256-GCM encryption implementation
- [ ] Key derivation function (HKDF)
- [ ] User-specific key generation
- [ ] Encrypted mnemonic delivery system
- [ ] Unit tests for encryption/decryption
- [ ] Security audit of encryption code
- [ ] Documentation: Encryption architecture

#### Testing Criteria
- Encrypt/decrypt 10,000 messages, 100% success rate
- Tampered ciphertext always rejected
- Keys derived consistently from same inputs
- No key material logged or stored unencrypted

---

### 6. Zero-Knowledge Proof Implementation (Week 4)

#### Scope
Basic ZK proof system for privacy-preserving transaction verification.

#### Use Case: Prove Sufficient Balance Without Revealing Amount
```
User wants to supply to Compound.
Bot needs to verify user has sufficient balance.
But user doesn't want to reveal exact balance to server logs.

Solution: User generates ZK proof:
"I have at least X USDC" (without revealing actual balance)
```

#### Technical Requirements

**ZK Circuit (Circom)**
```circom
template SufficientBalance() {
  signal input actualBalance;
  signal input requiredAmount;
  signal input balanceCommitment;
  signal output isValid;
  
  // Verify actualBalance >= requiredAmount
  component gte = GreaterEqThan(64);
  gte.in[0] <== actualBalance;
  gte.in[1] <== requiredAmount;
  
  // Verify commitment matches actual balance
  component hasher = Poseidon(1);
  hasher.inputs[0] <== actualBalance;
  balanceCommitment === hasher.out;
  
  isValid <== gte.out;
}
```

**Proof Generation Flow**
```typescript
// Client-side (future mobile app):
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  { 
    actualBalance: userBalance,
    requiredAmount: supplyAmount,
    balanceCommitment: poseidon([userBalance])
  },
  wasmFile,
  zkeyFile
);

// Server-side verification:
const verified = await snarkjs.groth16.verify(
  verificationKey,
  publicSignals,
  proof
);
```

**ZK Stack**
- **Circuit language**: Circom 2.0
- **Proof system**: Groth16 (fast verification)
- **Curve**: BN254 (Ethereum-friendly)
- **Library**: snarkjs
- **Trusted setup**: Powers of Tau ceremony

#### Deliverables Checklist
- [ ] Circom circuit for balance proof
- [ ] Circuit compilation and trusted setup
- [ ] Proof generation function
- [ ] Proof verification function
- [ ] Integration with supply command
- [ ] Unit tests for ZK proofs
- [ ] Documentation: ZK architecture

#### Testing Criteria
- Generate 100 proofs, all verify successfully
- Invalid proofs (insufficient balance) rejected 100%
- Proof generation <500ms on mobile device
- Proof verification <50ms on server
- Proof size <1KB for WhatsApp transmission

**Note**: This is a basic implementation for Milestone 1. Full privacy features will be expanded in Milestone 3.

---

## KPI Success Criteria

### Functional KPIs
- [x] ✅ **Webhook operational**: Accept and process 1000 messages with 99.9% success rate
- [ ] ✅ **Wallet creation**: 30+ test wallets created successfully
- [ ] ✅ **Transactions**: 30+ successful supply/withdraw transactions on mainnet
- [ ] ✅ **Commands**: All 5 commands (balance, supply, withdraw, markets, help) working
- [ ] ✅ **E2EE**: Mnemonic phrases delivered via encrypted messages

### Performance KPIs
- [ ] ✅ **Response time**: Average webhook acknowledgment <200ms
- [ ] ✅ **Transaction time**: Supply/withdraw completes within 30 seconds
- [ ] ✅ **Uptime**: 99.9% server uptime during testing period

### Security KPIs
- [ ] ✅ **No vulnerabilities**: Pass security audit with zero critical/high issues
- [ ] ✅ **Encryption**: All private keys encrypted, none in logs
- [ ] ✅ **Authentication**: Webhook signature verification blocks 100% invalid requests

### User Testing KPIs
- [ ] ✅ **Beta testers**: 30+ internal testers across Kenya, Nigeria, Uganda
- [ ] ✅ **Feedback**: Collect feedback from 100% of testers
- [ ] ✅ **Success rate**: 90%+ of testers complete full flow (create wallet → supply → withdraw)
- [ ] ✅ **Satisfaction**: 85%+ testers rate experience as "good" or "excellent"

---

## Technical Architecture

### System Diagram
```
┌─────────────────┐
│  WhatsApp User  │
└────────┬────────┘
         │ Message
         ▼
┌─────────────────────────────────────────────┐
│         WhatsApp Business API               │
└────────┬────────────────────────────────────┘
         │ Webhook POST
         ▼
┌─────────────────────────────────────────────┐
│       CompoundChat Webhook Server           │
│  - Signature verification                   │
│  - Rate limiting                            │
│  - Message parsing                          │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│          Command Handler Layer              │
│  - balance | supply | withdraw              │
│  - markets | help                           │
└────┬───────────────────────────────┬────────┘
     │                               │
     ▼                               ▼
┌──────────────┐            ┌─────────────────┐
│ Wallet Layer │            │  Compound Layer │
│ - Create     │            │  - Supply       │
│ - Encrypt    │            │  - Withdraw     │
│ - Sign       │            │  - Balance      │
└──────┬───────┘            └────────┬────────┘
       │                             │
       ▼                             ▼
┌──────────────┐            ┌─────────────────┐
│  PostgreSQL  │            │ Ethereum Mainnet│
│  - Users     │            │ (Alchemy RPC)   │
│  - Wallets   │            │ Compound V3     │
│  - Txns      │            │ Comet Contracts │
└──────────────┘            └─────────────────┘
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  whatsapp_id VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP,
  language VARCHAR(10) DEFAULT 'en',
  consent_given BOOLEAN DEFAULT FALSE
);

-- Wallets table (see section 2 for full schema)
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  ethereum_address VARCHAR(42) NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  encryption_salt VARCHAR(64) NOT NULL,
  encryption_iv VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL, -- 'supply', 'withdraw', 'borrow', 'repay'
  token VARCHAR(10) NOT NULL,
  amount NUMERIC(78, 0) NOT NULL, -- Store as wei/smallest unit
  status VARCHAR(20) NOT NULL, -- 'pending', 'confirmed', 'failed'
  block_number BIGINT,
  gas_used BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Sessions table (Redis alternative for conversation state)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  state JSONB NOT NULL, -- Current conversation state
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

---

## Testing Plan

### Unit Tests
**Coverage Target**: 85% minimum

**Test Files**:
- `tests/unit/wallet/creation.test.ts`
- `tests/unit/wallet/encryption.test.ts`
- `tests/unit/compound/supply.test.ts`
- `tests/unit/compound/withdraw.test.ts`
- `tests/unit/bot/command-parser.test.ts`
- `tests/unit/encryption/aes.test.ts`
- `tests/unit/zk/proofs.test.ts`

**Example Test**:
```typescript
describe('Wallet Creation', () => {
  it('should generate valid 24-word mnemonic', () => {
    const mnemonic = generateMnemonic(256);
    expect(mnemonic.split(' ')).toHaveLength(24);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('should derive consistent address from mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const wallet1 = Wallet.fromPhrase(mnemonic);
    const wallet2 = Wallet.fromPhrase(mnemonic);
    expect(wallet1.address).toBe(wallet2.address);
  });

  it('should encrypt and decrypt private key successfully', async () => {
    const privateKey = '0x1234...'; // Test key
    const userId = 'test-user-123';
    
    const encrypted = await encryptPrivateKey(privateKey, userId);
    const decrypted = await decryptPrivateKey(encrypted, userId);
    
    expect(decrypted).toBe(privateKey);
  });
});
```

### Integration Tests
**Test Scenarios**:
1. **Wallet Creation Flow**: User sends "create wallet" → Bot generates wallet → User receives mnemonic
2. **Supply Flow**: User sends "supply 10 USDC" → Bot checks balance → Executes transaction → Confirms
3. **Withdraw Flow**: User sends "withdraw 5 USDC" → Bot checks Compound balance → Executes → Confirms
4. **Balance Check**: User sends "balance" → Bot queries blockchain + Compound → Returns formatted response

**Test Files**:
- `tests/integration/wallet-creation.test.ts`
- `tests/integration/supply-withdraw.test.ts`
- `tests/integration/webhook-security.test.ts`

### End-to-End Tests
**Environment**: Sepolia testnet (dev), Ethereum mainnet (staging)

**Test Scenarios**:
```typescript
describe('E2E: Complete User Journey', () => {
  it('should handle full flow from wallet creation to earning', async () => {
    // 1. User sends "create wallet"
    await sendWhatsAppMessage(testUserId, 'create wallet');
    const walletResponse = await waitForBotResponse();
    expect(walletResponse).toContain('0x'); // Address
    
    // 2. Fund test wallet with USDC
    await fundTestWallet(testWallet, '1000', 'USDC');
    
    // 3. User checks balance
    await sendWhatsAppMessage(testUserId, 'balance');
    const balanceResponse = await waitForBotResponse();
    expect(balanceResponse).toContain('1000 USDC');
    
    // 4. User supplies to Compound
    await sendWhatsAppMessage(testUserId, 'supply 100 USDC');
    const supplyResponse = await waitForBotResponse();
    expect(supplyResponse).toContain('✅ Supply Successful');
    
    // 5. Verify on-chain
    const compoundBalance = await checkCompoundBalance(testWallet);
    expect(compoundBalance).toBeGreaterThanOrEqual(100);
    
    // 6. User withdraws
    await sendWhatsAppMessage(testUserId, 'withdraw 50 USDC');
    const withdrawResponse = await waitForBotResponse();
    expect(withdrawResponse).toContain('✅ Withdrawal Successful');
  });
});
```

### Security Testing
**Automated Scans**:
- Snyk vulnerability scanning (daily)
- Dependabot alerts (GitHub)
- npm audit (pre-commit hook)

**Manual Testing**:
- Penetration testing of webhook endpoints
- Encryption algorithm review
- Key management audit
- Transaction replay attack testing
- Rate limiting bypass attempts

---

## Security Considerations

### Threat Model

**Assets to Protect**:
1. User private keys (highest priority)
2. User mnemonic phrases
3. User funds on Compound
4. User personal data (phone numbers)
5. Server infrastructure

**Threat Actors**:
- External attackers (hackers)
- Malicious insiders (compromised team member)
- Nation-state actors (surveillance)
- Social engineers (phishing)

**Attack Vectors**:
1. **Webhook compromise**: Attacker sends malicious messages
   - Mitigation: Signature verification, rate limiting
2. **Database breach**: Attacker gains DB access
   - Mitigation: Encrypted private keys, no plaintext mnemonics
3. **Man-in-the-middle**: Attacker intercepts messages
   - Mitigation: HTTPS/TLS, E2EE for sensitive data
4. **Social engineering**: Attacker tricks user into revealing mnemonic
   - Mitigation: User education, never ask for mnemonic
5. **Smart contract exploit**: Compound V3 vulnerability
   - Mitigation: Use audited contracts only, insurance (future)

### Security Checklist (Pre-Launch)
- [ ] Private keys encrypted with AES-256-GCM
- [ ] Master encryption key stored in KMS
- [ ] No secrets in code or environment variables (checked into git)
- [ ] Webhook signature verification enforced
- [ ] Rate limiting active (10 req/min per user)
- [ ] HTTPS enforced, TLS 1.3 minimum
- [ ] SQL injection protection (parameterized queries)
- [ ] Input validation on all user inputs
- [ ] Error messages don't leak sensitive info
- [ ] Logging sanitized (no keys/mnemonics)
- [ ] Database backups encrypted and tested
- [ ] Disaster recovery plan documented
- [ ] Security audit completed by external firm
- [ ] Penetration testing passed
- [ ] Team security training completed

---

## Deployment Plan

### Infrastructure Setup

**Hosting**: AWS (primary), DigitalOcean (backup)

**Architecture**:
```
┌──────────────────────────────────────────┐
│  CloudFlare (DDoS protection, CDN)       │
└─────────────────┬────────────────────────┘
                  │
┌─────────────────▼────────────────────────┐
│  AWS ALB (Load Balancer)                 │
└─────────────────┬────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  EC2 Instance  │  │  EC2 Instance   │
│  (Webhook)     │  │  (Webhook)      │
└───────┬────────┘  └──────┬──────────┘
        │                  │
        └─────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼──┐    ┌────▼────┐   ┌───▼────┐
│ RDS  │    │ Redis   │   │ KMS    │
│(Postgres)│ (Cache) │   │(Secrets)│
└──────┘    └─────────┘   └────────┘
```

**Environments**:
1. **Development**: Local (Docker Compose)
2. **Staging**: AWS (Sepolia testnet)
3. **Production**: AWS (Ethereum mainnet)

### Deployment Steps (Milestone 1 Beta)

**Week 4, Day 5-7**:

1. **Infrastructure Setup**
   ```bash
   # Provision AWS resources
   terraform init
   terraform plan -out=milestone1.tfplan
   terraform apply milestone1.tfplan
   
   # Resources created:
   # - 2x EC2 instances (t3.medium)
   # - RDS PostgreSQL (db.t3.small)
   # - ElastiCache Redis (cache.t3.micro)
   # - ALB with HTTPS listener
   # - KMS key for encryption
   # - CloudWatch alarms
   ```

2. **Database Migration**
   ```bash
   # Run migrations
   npm run migrate:production
   
   # Verify schema
   npm run migrate:verify
   ```

3. **Environment Configuration**
   ```bash
   # Store secrets in AWS Secrets Manager
   aws secretsmanager create-secret \
     --name compound-chat-production \
     --secret-string file://secrets.json
   
   # Secrets include:
   # - Master encryption key
   # - WhatsApp API credentials
   # - Database connection string
   # - Ethereum RPC URLs
   ```

4. **Application Deployment**
   ```bash
   # Build production bundle
   npm run build
   
   # Deploy to EC2
   pm2 deploy production
   
   # Verify health
   curl https://api.compoundchat.xyz/health
   ```

5. **WhatsApp Configuration**
   - Register webhook URL with WhatsApp
   - Verify webhook security
   - Test message delivery

6. **Monitoring Setup**
   - Configure CloudWatch dashboards
   - Set up alerts (Slack, PagerDuty)
   - Enable error tracking (Sentry)

### Beta Testing Rollout

**Phase 1: Internal Team (3 testers)**
- Day 1: Beacher, Bunny, Wisdom test all commands
- Goal: Find critical bugs

**Phase 2: Extended Team (10 testers)**
- Days 2-3: Friends and family in Kenya, Nigeria, Uganda
- Goal: Test across different network conditions

**Phase 3: Pilot Users (17 testers)**
- Days 4-7: Recruit from crypto communities
- Goal: Real-world usage feedback

**Testing Checklist per Tester**:
- [ ] Receive bot number via secure channel
- [ ] Send "help" command
- [ ] Create new wallet
- [ ] Receive and backup mnemonic
- [ ] Fund wallet with test USDC ($10-20)
- [ ] Check balance
- [ ] Supply $10 USDC to Compound
- [ ] Check balance again (verify interest accrual)
- [ ] Withdraw $5 USDC
- [ ] Complete feedback survey

**Feedback Collection**:
- Google Form with questions on:
  - Ease of use (1-5 scale)
  - Command clarity (1-5 scale)
  - Response speed (1-5 scale)
  - Error handling (1-5 scale)
  - Overall satisfaction (1-5 scale)
  - Open-ended: What was confusing?
  - Open-ended: What features are missing?

---

## Documentation Deliverables

### Technical Documentation
- [ ] **README.md**: Project overview, setup instructions
- [ ] **ARCHITECTURE.md**: System design, data flows
- [ ] **API.md**: Webhook API reference, command format
- [ ] **SECURITY.md**: Security architecture, threat model
- [ ] **DEPLOYMENT.md**: Infrastructure setup, deployment steps
- [ ] **TESTING.md**: How to run tests, coverage reports

### User Documentation
- [ ] **User Guide**: How to use CompoundChat (with screenshots)
- [ ] **FAQ**: Common questions and troubleshooting
- [ ] **Safety Guide**: Best practices for securing wallet

### Code Documentation
- [ ] JSDoc for all public functions
- [ ] Inline comments for complex logic
- [ ] README in each module directory

---

## Budget Breakdown ($7,000)

| Category | Cost | Description |
|----------|------|-------------|
| **Development** | $5,000 | 4 weeks @ $1,250/week for 3 engineers ($416/week each) |
| **Infrastructure** | $800 | AWS hosting (EC2, RDS, ElastiCache) for 4 weeks |
| **WhatsApp API** | $300 | Business API setup + message costs (est. 10,000 msgs) |
| **Testing Incentives** | $600 | $20 USDC per tester × 30 testers for gas + supply testing |
| **Security Audit** | $300 | Initial automated scans + code review tools (Snyk Pro) |

**Total**: $7,000

---

## Risks & Mitigation

### Technical Risks

**Risk 1: WhatsApp API Restrictions**
- **Impact**: High (could block entire project)
- **Likelihood**: Medium (WhatsApp has strict policies)
- **Mitigation**: 
  - Review WhatsApp Business Policy thoroughly
  - Maintain compliance (no spam, clear opt-in)
  - Have SMS fallback ready
  - Build abstraction layer for easy platform switching

**Risk 2: Smart Contract Vulnerabilities**
- **Impact**: Critical (user funds at risk)
- **Likelihood**: Low (using audited Compound V3)
- **Mitigation**:
  - Only interact with audited contracts
  - Use standard patterns from Compound docs
  - Independent security review
  - Start with small amounts in beta
  - Insurance fund for potential losses

**Risk 3: Key Management Failure**
- **Impact**: Critical (loss of user funds)
- **Likelihood**: Low (battle-tested crypto libraries)
- **Mitigation**:
  - Use ethers.js (millions of users)
  - Comprehensive unit tests
  - Security audit focused on encryption
  - User education on mnemonic backup

**Risk 4: Network Congestion (High Gas Fees)**
- **Impact**: Medium (transactions too expensive)
- **Likelihood**: Medium (Ethereum gas spikes unpredictable)
- **Mitigation**:
  - Monitor gas prices, warn users if >100 gwei
  - Transaction queuing for low-gas periods
  - Consider L2 rollup for Milestone 2+
  - Batch operations where possible

### Operational Risks

**Risk 5: Testing Delays**
- **Impact**: Medium (miss milestone timeline)
- **Likelihood**: Medium (beta tester coordination challenging)
- **Mitigation**:
  - Recruit testers early (Week 2)
  - Incentivize participation ($20 USDC)
  - Clear testing instructions
  - Have 40 testers lined up (33% buffer)

**Risk 6: Regulatory Issues**
- **Impact**: High (could halt operations)
- **Likelihood**: Low (focus on non-custodial tool)
- **Mitigation**:
  - Position as non-custodial software tool
  - Clear disclaimers (no financial advice)
  - User owns and controls keys
  - Consult legal expert before beta launch

---

## Success Metrics (Post-Milestone)

### Quantitative KPIs
- [ ] 30+ wallets created
- [ ] 30+ successful supply transactions
- [ ] 30+ successful withdraw transactions
- [ ] $1,000+ TVL supplied to Compound (across all testers)
- [ ] 99.9% server uptime
- [ ] <200ms average webhook response time
- [ ] Zero security incidents
- [ ] Zero fund losses

### Qualitative KPIs
- [ ] 85%+ tester satisfaction (feedback survey)
- [ ] All testers complete full flow (wallet → supply → withdraw)
- [ ] Positive feedback from Compound team
- [ ] Code passes external security review
- [ ] Documentation complete and clear

---

## Next Steps After Milestone 1

If Milestone 1 is successful, proceed to:

**Milestone 2**: Mobile Money Integration & UX Refinement
- M-Pesa and MTN Mobile Money APIs
- Fiat on/off-ramp flows
- 200+ users in 3 African countries
- $50,000+ transaction volume

**Immediate Actions Post-Milestone 1**:
1. Incorporate beta tester feedback
2. Fix any bugs discovered in testing
3. Complete security audit recommendations
4. Begin M-Pesa integration research
5. Recruit Milestone 2 beta testers in Kenya

---

## Contact & Support

**Team**:
- **Beacher** (Security Lead): GitHub @0Xbeach | Telegram @0Xbeach
- **Bunny** (Backend Lead): GitHub TBD
- **Wisdom** (Integration Lead): GitHub TBD

**Communication**:
- Daily standup: 9 AM EAT (East Africa Time)
- Weekly progress report: Every Friday
- Emergency contact: Telegram group chat

**Repository**:
- GitHub: `github.com/compoundchat/compoundchat` (private during Milestone 1)
- Issues: Track bugs and features in GitHub Issues
- Wiki: Technical documentation and runbooks

---

## Milestone 1 Timeline (Detailed)

### Week 1: Foundation
**Days 1-2**: Project setup
- Initialize repo, configure TypeScript
- Set up database (PostgreSQL + Redis)
- Create project structure

**Days 3-4**: Webhook infrastructure
- Implement Express server
- WhatsApp Business API integration
- Signature verification
- Rate limiting

**Days 5-7**: Basic bot logic
- Message parsing
- Command routing
- Session management
- `help` command implementation

### Week 2: Wallet System
**Days 8-9**: Wallet creation
- BIP39 mnemonic generation
- BIP44 HD derivation
- Address generation

**Days 10-11**: Key encryption
- AES-256-GCM implementation
- Key derivation function
- Database storage

**Days 12-14**: Wallet recovery & testing
- Mnemonic recovery flow
- Wallet import (private key + mnemonic)
- Comprehensive unit tests
- Integration tests

### Week 3: Compound Integration
**Days 15-16**: Contract setup
- Compound V3 ABI integration
- Contract connection (ethers.js)
- RPC provider configuration

**Days 17-18**: Supply & Withdraw
- Implement supply function
- Implement withdraw function
- Transaction status tracking

**Days 19-21**: Commands & UX
- `balance` command (wallet + Compound)
- `supply` command with parsing
- `withdraw` command with parsing
- `markets` command (APYs)
- Error handling and user-friendly messages

### Week 4: Security & Testing
**Days 22-23**: E2EE implementation
- End-to-end encryption for mnemonics
- Secure key exchange

**Days 24-25**: ZK proofs (basic)
- Circuit design (balance verification)
- Proof generation/verification
- Integration with supply command

**Days 26-27**: Security hardening
- Security audit
- Penetration testing
- Fix vulnerabilities

**Days 28**: Deployment & Beta Launch
- Production deployment
- Beta tester onboarding
- Monitoring and support

---

## Appendix

### Glossary
- **Comet**: Compound V3 smart contract for a specific base asset
- **Base Asset**: Primary lending asset (USDC, ETH)
- **Collateral**: Assets supplied to back borrowing
- **APY**: Annual Percentage Yield (interest rate)
- **TVL**: Total Value Locked (total assets supplied)
- **E2EE**: End-to-End Encryption
- **ZK**: Zero-Knowledge (cryptographic proof)
- **KMS**: Key Management Service (secure key storage)

### Resources
- [Compound V3 Docs](https://docs.compound.finance/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Ethers.js Docs](https://docs.ethers.org/v6/)
- [Circom Docs](https://docs.circom.io/)
- [BIP39 Spec](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 Spec](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)

### Code Examples
See `/examples` directory (to be created) for:
- Wallet creation example
- Supply transaction example
- Withdraw transaction example
- E2EE encryption example
- ZK proof generation example

---

**Document Version**: 1.0  
**Last Updated**: November 24, 2025  
**Authors**: Beacher, Bunny, Wisdom  
**Status**: ✅ Approved - Ready for Implementation

