# CompoundChat Security Architecture

**Version**: 1.0  
**Last Updated**: November 24, 2025  
**Classification**: Public

---

## Table of Contents

1. [Security Principles](#security-principles)
2. [Threat Model](#threat-model)
3. [Cryptographic Architecture](#cryptographic-architecture)
4. [Key Management](#key-management)
5. [Wallet Security](#wallet-security)
6. [Network Security](#network-security)
7. [Data Protection](#data-protection)
8. [Incident Response](#incident-response)
9. [Security Checklist](#security-checklist)

---

## Security Principles

CompoundChat is built on these core security principles:

### 1. Defense in Depth
Multiple layers of security controls protect user assets:
- Application layer: Input validation, rate limiting
- Transport layer: TLS 1.3+, certificate pinning
- Data layer: Encryption at rest, encrypted backups
- Access layer: Authentication, authorization, audit logging

### 2. Principle of Least Privilege
Every component has minimal access required:
- Webhook server: Read-only database access
- Background workers: Specific table permissions
- Admins: No access to encrypted private keys

### 3. Zero Trust Architecture
Never trust, always verify:
- Validate all inputs (including from database)
- Verify webhook signatures on every request
- Check transaction status on-chain, not just RPC response
- Assume any component can be compromised

### 4. Fail Secure
All error conditions default to safe states:
- Failed decryption → Abort operation, alert admin
- Invalid signature → Reject request, log incident
- RPC timeout → Queue retry, notify user

### 5. User Sovereignty
Users always control their funds:
- Non-custodial wallets (users own private keys)
- Recovery via mnemonic phrase (no backdoors)
- Transparent operations (all transactions on-chain)

---

## Threat Model

### Assets to Protect (Priority Order)

1. **User private keys** (Critical)
   - Loss = permanent loss of user funds
   - Compromise = theft of user funds
   
2. **User mnemonic phrases** (Critical)
   - Loss = inability to recover wallet
   - Compromise = theft of current + future funds
   
3. **User funds on Compound** (Critical)
   - Loss = direct financial harm
   - Theft = reputational damage, legal liability
   
4. **User personal data** (High)
   - Phone numbers, transaction history
   - Breach = privacy violation, regulatory issues
   
5. **Service availability** (Medium)
   - Downtime = poor UX, lost growth
   - DDoS = service disruption

### Threat Actors

#### 1. External Attackers (High Likelihood)
**Motivation**: Financial gain  
**Capabilities**: Moderate to high technical skills  
**Attack Vectors**:
- Webhook exploitation
- Database breach
- Man-in-the-middle attacks
- Social engineering users
- DDoS attacks

#### 2. Malicious Insiders (Low Likelihood)
**Motivation**: Financial gain, sabotage  
**Capabilities**: High (system access)  
**Attack Vectors**:
- Database access to encrypted keys
- Code modifications (backdoors)
- Credential theft

#### 3. Nation-State Actors (Low Likelihood)
**Motivation**: Surveillance, disruption  
**Capabilities**: Very high  
**Attack Vectors**:
- Network surveillance
- Supply chain attacks
- Zero-day exploits

#### 4. Opportunistic Attackers (High Likelihood)
**Motivation**: Financial gain (low effort)  
**Capabilities**: Low  
**Attack Vectors**:
- Phishing users
- Automated scanning for vulnerabilities
- Credential stuffing

### Attack Scenarios & Mitigations

#### Scenario 1: Database Breach
**Attack**: Attacker gains read access to PostgreSQL database

**Impact WITHOUT mitigation**:
- Access to all encrypted private keys
- Access to user phone numbers
- Transaction history

**Mitigation**:
✅ Private keys encrypted with AES-256-GCM  
✅ Master key stored in AWS KMS (not in database)  
✅ Per-user salt prevents rainbow tables  
✅ Phone numbers can be hashed (future enhancement)  
✅ Database access requires VPN + MFA  

**Result**: Attacker gets encrypted data only, cannot decrypt without KMS access

#### Scenario 2: Webhook Compromise
**Attack**: Attacker sends malicious messages to webhook endpoint

**Impact WITHOUT mitigation**:
- Trigger unauthorized transactions
- Drain user funds
- Crash service (DoS)

**Mitigation**:
✅ Signature verification (HMAC-SHA256)  
✅ Timestamp validation (replay prevention)  
✅ Rate limiting (10 req/min per user)  
✅ Input validation (Joi schemas)  
✅ Transaction requires user confirmation  

**Result**: Malicious messages rejected at webhook layer

#### Scenario 3: Man-in-the-Middle (MITM)
**Attack**: Attacker intercepts WhatsApp messages

**Impact WITHOUT mitigation**:
- Read sensitive data (mnemonics)
- Modify transaction parameters
- Steal session tokens

**Mitigation**:
✅ WhatsApp uses E2EE (TLS for API calls)  
✅ Sensitive data (mnemonics) sent only once, then deleted  
✅ No session tokens (stateless where possible)  
✅ Transaction parameters verified on-chain  

**Result**: Limited exposure; mnemonic at risk only during initial send

#### Scenario 4: Social Engineering
**Attack**: Attacker tricks user into revealing mnemonic

**Impact**: 
- Full wallet compromise
- Irreversible fund theft

**Mitigation**:
✅ User education: "Never share your recovery phrase"  
✅ Bot never asks for mnemonic  
✅ Warning messages on wallet creation  
⚠️ Cannot prevent determined user from sharing  

**Result**: Reduced risk through education, but not eliminated

#### Scenario 5: Smart Contract Exploit
**Attack**: Bug in Compound V3 contracts exploited

**Impact**:
- Loss of user funds on Compound
- Reputational damage

**Mitigation**:
✅ Use only audited Compound V3 contracts  
✅ No custom smart contracts (use standard patterns)  
✅ Monitor Compound governance for critical updates  
✅ Emergency withdrawal feature (future)  
✅ Insurance fund for losses (future)  

**Result**: Risk minimized by using battle-tested protocols

---

## Cryptographic Architecture

### Encryption Standards

#### Private Key Encryption (AES-256-GCM)
```typescript
Algorithm: AES-256-GCM (Authenticated Encryption)
Key Size: 256 bits
IV Size: 96 bits (random, unique per encryption)
Tag Size: 128 bits (authentication tag)
Key Derivation: HKDF-SHA256

Inputs:
- plaintext: User's private key (32 bytes)
- key: Derived from user phone + master key
- iv: Random 96-bit value
- aad: Additional authenticated data (user ID)

Outputs:
- ciphertext: Encrypted private key
- tag: Authentication tag (prevents tampering)
```

**Why AES-256-GCM?**
- NIST-approved, FIPS 140-2 compliant
- Authenticated encryption (integrity + confidentiality)
- Fast on modern hardware (AES-NI support)
- Resistant to timing attacks

#### Key Derivation Function (HKDF-SHA256)
```typescript
Function: HKDF (HMAC-based KDF)
Hash: SHA-256
Input Key Material (IKM): Master key from KMS
Salt: Random 32-byte value (unique per user)
Info: User ID + "compoundchat-wallet-v1"
Output Length: 32 bytes (256 bits)

Derived Key = HKDF-SHA256(
  ikm = masterKey,
  salt = userSalt,
  info = userId + version,
  length = 32
)
```

**Why HKDF?**
- Cryptographically sound key derivation
- Prevents key reuse across users
- Salt ensures unique keys even with same master
- Info parameter binds key to specific use case

### Wallet Cryptography

#### BIP39 Mnemonic Generation
```typescript
Entropy: 256 bits (cryptographically secure random)
Checksum: 8 bits (SHA-256 of entropy)
Mnemonic: 24 words (from BIP39 wordlist)
Language: English (standardized)

Security Properties:
- 2^256 possible mnemonics (practically unbreakable)
- Checksum detects typos/corruption
- Standardized across wallets (MetaMask compatible)
```

#### HD Wallet Derivation (BIP44)
```typescript
Derivation Path: m/44'/60'/0'/0/0
  m = master key
  44' = BIP44 standard
  60' = Ethereum (coin type)
  0' = Account 0
  0 = External chain
  0 = First address

Algorithm: HMAC-SHA512 for child key derivation
Hardened Keys: Yes (apostrophe indicates hardened)
```

**Why BIP44?**
- Industry standard (compatible with all major wallets)
- Hierarchical structure allows multiple accounts
- Hardened derivation prevents parent key extraction

### Zero-Knowledge Proofs (Milestone 1 Basic Implementation)

#### Balance Proof Circuit
```circom
// Prove: "I have at least X tokens" without revealing actual balance

Proof System: Groth16
Curve: BN254 (Ethereum-friendly)
Circuit Language: Circom 2.0

Public Inputs:
- requiredAmount (what user wants to supply)
- balanceCommitment (Poseidon hash of actual balance)

Private Inputs:
- actualBalance (secret)

Constraints:
1. actualBalance >= requiredAmount
2. Poseidon(actualBalance) == balanceCommitment

Proof Size: ~200 bytes
Generation Time: <500ms (on mobile)
Verification Time: <50ms (on server)
```

**Why Groth16?**
- Smallest proof size (good for WhatsApp bandwidth)
- Fast verification (constant time)
- Ethereum-compatible (for future on-chain use)

---

## Key Management

### Master Encryption Key

**Storage**: AWS Key Management Service (KMS)  
**Access**: IAM role with strict permissions  
**Rotation**: Quarterly (automated)  
**Backup**: Multi-region replication  

**Security Controls**:
- ✅ Never stored in code or environment files
- ✅ Never logged (even in encrypted form)
- ✅ Accessed only via AWS SDK with IAM auth
- ✅ Audit logging (CloudTrail)
- ✅ Automatic rotation with version tracking

### User-Specific Keys

**Derivation**: HKDF from master key + user salt  
**Storage**: Salt stored in database, key derived on-demand  
**Lifecycle**: Generated on wallet creation, never changed  

**Properties**:
- Unique per user (even with same master key)
- Reproducible (same inputs → same output)
- Cannot reverse-engineer master key from derived key

### Key Hierarchy

```
AWS KMS Master Key
       ↓
Master Encryption Key (MEK)
       ↓
HKDF(MEK, userSalt, userId)
       ↓
User-Specific Key (USK)
       ↓
AES-256-GCM(privateKey, USK)
       ↓
Encrypted Private Key (stored in DB)
```

### Key Rotation Procedure

**When to Rotate**:
- Quarterly (scheduled)
- After suspected compromise
- Major security update
- Team member departure (if they had KMS access)

**Rotation Steps**:
1. Generate new master key in KMS
2. Re-encrypt all private keys with new key
3. Update key version in database
4. Verify all wallets still accessible
5. Archive old key (for disaster recovery)
6. Monitor for decryption errors

**Downtime**: None (rolling update)

---

## Wallet Security

### Creation Flow (Security Perspective)

```typescript
1. User sends "create wallet"
   ↓
2. Generate 256-bit entropy (crypto.randomBytes)
   ↓
3. Create BIP39 mnemonic (24 words)
   ↓
4. Derive HD wallet (BIP44 path)
   ↓
5. Extract private key + address
   ↓
6. Generate random salt (32 bytes)
   ↓
7. Derive user key: HKDF(masterKey, salt, userId)
   ↓
8. Encrypt private key: AES-GCM(privateKey, userKey)
   ↓
9. Store: address, encryptedKey, salt, iv (NO mnemonic!)
   ↓
10. Send mnemonic to user (E2EE via WhatsApp)
   ↓
11. Zero out mnemonic from memory (overwrite buffer)
   ↓
12. User confirms backup
   ↓
13. Wallet ready
```

**Security Critical Steps**:
- Entropy: MUST use `crypto.randomBytes` (not `Math.random`)
- Mnemonic: NEVER stored in database (not even encrypted)
- Memory: Zero out buffers after encryption
- Transmission: Mnemonic sent exactly once, then deleted

### Transaction Signing (Security Perspective)

```typescript
1. User sends "supply 100 USDC"
   ↓
2. Parse and validate command
   ↓
3. Fetch encrypted private key from DB
   ↓
4. Derive user key (same HKDF as creation)
   ↓
5. Decrypt private key (AES-GCM)
   ↓
6. Verify decryption (check auth tag)
   ↓
7. Create ethers.Wallet(privateKey) IN MEMORY
   ↓
8. Build transaction (supply call to Comet)
   ↓
9. Sign transaction (in-memory only)
   ↓
10. Zero out private key from memory
   ↓
11. Broadcast signed transaction
   ↓
12. Monitor transaction status
   ↓
13. Confirm to user
```

**Security Critical Steps**:
- Decryption: Verify GCM auth tag (prevents tampering)
- Memory: Private key exists in memory only during signing
- Cleanup: Overwrite memory after signing (prevent leaks)
- Validation: Check transaction params match user intent

### Memory Safety

```typescript
// BAD: Private key lingers in memory
const privateKey = decryptPrivateKey(encrypted);
const wallet = new ethers.Wallet(privateKey);
const tx = await wallet.sendTransaction(...);
// privateKey still in memory!

// GOOD: Explicit cleanup
const privateKey = decryptPrivateKey(encrypted);
try {
  const wallet = new ethers.Wallet(privateKey);
  const tx = await wallet.sendTransaction(...);
} finally {
  // Zero out private key (overwrite memory)
  if (typeof privateKey === 'string') {
    privateKey = '0'.repeat(privateKey.length);
  }
  // Let GC clean up
}
```

---

## Network Security

### TLS Configuration

```
Protocol: TLS 1.3 (minimum TLS 1.2)
Cipher Suites: 
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256
Certificate: Let's Encrypt (auto-renewal)
HSTS: Enabled (max-age=31536000)
Certificate Pinning: Future enhancement
```

### Webhook Security

#### Signature Verification
```typescript
// WhatsApp webhook signature format
Header: X-Hub-Signature-256
Value: sha256=<hex_signature>

Verification:
const signature = hmac_sha256(
  key: WEBHOOK_SECRET,
  data: request.body (raw bytes)
);

if (signature !== header_signature) {
  throw new WebhookError('INVALID_SIGNATURE');
}
```

#### Rate Limiting
```
Per-User Limits:
- 10 requests / minute (normal operations)
- 1 wallet creation / hour (prevent abuse)
- 5 transactions / minute (prevent spam)

Global Limits:
- 1,000 requests / minute (total)
- Circuit breaker at 5,000 req/min (DDoS protection)

Implementation: Redis (sliding window)
```

### DDoS Protection

**Layers**:
1. CloudFlare (L3/L4 DDoS protection)
2. AWS Shield (infrastructure protection)
3. Application rate limiting (L7)
4. Circuit breakers (automatic shutdown on attack)

---

## Data Protection

### Data Classification

| Data Type | Classification | Encryption | Retention |
|-----------|----------------|------------|-----------|
| Private keys | Critical | AES-256-GCM | Indefinite |
| Mnemonics | Critical | Never stored | N/A |
| User phone | Sensitive | Plaintext* | 36 months |
| Tx history | Sensitive | Plaintext | 36 months |
| Session data | Transient | N/A | 24 hours |

*Future: Hash phone numbers for privacy

### Encryption at Rest

**Database**: PostgreSQL with encrypted volumes (AWS RDS)  
**Backups**: Encrypted with separate KMS key  
**Logs**: Sensitive fields redacted before writing  

### Data Retention

**Active Users**:
- Wallet data: Retained while account active
- Transaction history: 36 months (regulatory)
- Session data: 24 hours (Redis TTL)

**Deleted Accounts**:
- Private keys: Deleted immediately
- Transaction history: Anonymized after 90 days
- Phone numbers: Deleted after 90 days

---

## Incident Response

### Security Incident Classification

**P0 - Critical** (Response: Immediate)
- Private key leak
- Master key compromise
- Active exploitation of vulnerability
- Data breach (PII exposure)

**P1 - High** (Response: <1 hour)
- Vulnerability discovered (unpatched)
- Suspicious admin activity
- Failed decryption spike (possible attack)

**P2 - Medium** (Response: <24 hours)
- DoS attack (service degraded)
- Unauthorized access attempt (blocked)

**P3 - Low** (Response: <1 week)
- Security misconfiguration (no exploit)
- Deprecated dependency

### Incident Response Playbook

#### Private Key Leak (P0)
1. **Immediate** (0-5 minutes):
   - Shut down affected service
   - Rotate master encryption key
   - Alert all team members
   
2. **Short-term** (5-30 minutes):
   - Identify affected users
   - Assess if funds are at risk
   - Prepare user notification
   
3. **Recovery** (30 min - 24 hours):
   - Help users create new wallets
   - Guide fund transfers to new wallets
   - Root cause analysis
   
4. **Post-incident** (1-7 days):
   - Security audit of entire system
   - Implement additional controls
   - Public disclosure (if appropriate)

#### Database Breach (P0)
1. **Immediate**:
   - Isolate database
   - Verify encryption (keys still secure?)
   - Change all passwords
   
2. **Assessment**:
   - What data was accessed?
   - Encrypted keys = low risk (master key in KMS)
   - User phone numbers = privacy breach
   
3. **Notification**:
   - Inform affected users within 72 hours (GDPR)
   - Explain what data was exposed
   - Steps users should take (if any)

---

## Security Checklist

### Pre-Deployment (Milestone 1)

**Code Security**:
- [ ] No private keys in code (scan with `git secrets`)
- [ ] No secrets in .env (use .env.example template)
- [ ] All user inputs validated (Joi schemas)
- [ ] SQL queries parameterized (no string concat)
- [ ] Crypto libraries up-to-date (`npm audit`)
- [ ] Dependencies scanned (Snyk)

**Cryptography**:
- [ ] AES-256-GCM implemented correctly
- [ ] Master key in KMS (not env variables)
- [ ] Random values use `crypto.randomBytes`
- [ ] Private keys zeroed after use
- [ ] Mnemonic never stored in database

**Network**:
- [ ] HTTPS enforced (no HTTP)
- [ ] Webhook signature verification enabled
- [ ] Rate limiting active
- [ ] CORS configured properly
- [ ] Helmet.js security headers

**Database**:
- [ ] Private keys encrypted at rest
- [ ] Database backups encrypted
- [ ] Access requires VPN (production)
- [ ] Least privilege permissions

**Testing**:
- [ ] 85%+ coverage on security code
- [ ] Penetration testing completed
- [ ] Fuzzing on input validation
- [ ] Load testing (100+ concurrent users)

**Operations**:
- [ ] Monitoring configured (Sentry)
- [ ] Alerts set up (PagerDuty)
- [ ] Incident response plan documented
- [ ] Team security training completed

### Ongoing (Post-Launch)

**Monthly**:
- [ ] Review access logs
- [ ] Check for unusual patterns
- [ ] Update dependencies
- [ ] Review rate limit logs

**Quarterly**:
- [ ] Rotate master encryption key
- [ ] Security audit
- [ ] Penetration testing
- [ ] Review and update threat model

**Annually**:
- [ ] Third-party security audit
- [ ] Disaster recovery drill
- [ ] Update security documentation
- [ ] Team security refresher training

---

## Contact

**Security Issues**: security@compoundchat.xyz  
**PGP Key**: [To be published]  
**Bug Bounty**: [Future: HackerOne program]

---

**Document Owner**: Beacher (Security Lead)  
**Review Cadence**: Quarterly  
**Next Review**: February 24, 2026

