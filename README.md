# 🌍 CompoundChat - DeFi for 2+ Billion Users

> Bringing Compound's lending and borrowing protocols to WhatsApp, unlocking DeFi for mobile-first markets in Africa and beyond.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20+-green)](https://nodejs.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-purple)](https://ethereum.org/)

## 🎯 Mission

CompoundChat makes DeFi accessible to anyone with a phone and WhatsApp. No app downloads, no browser extensions, no complex UIs — just simple text commands to earn interest on crypto savings.

**Target Markets**: Kenya 🇰🇪 | Nigeria 🇳🇬 | Uganda 🇺🇬 | Ghana 🇬🇭 | Tanzania 🇹🇿

## ✨ Features (Milestone 1)

- 💬 **Chat-Based DeFi**: Interact with Compound through simple WhatsApp messages
- 🔐 **Non-Custodial Wallets**: Users control their own keys with military-grade encryption
- 💰 **Supply & Withdraw**: Deposit crypto to earn interest, withdraw anytime
- 📊 **Real-Time Balances**: Check wallet and Compound positions instantly
- 🔒 **End-to-End Encryption**: Sensitive data protected with AES-256-GCM
- 🛡️ **Zero-Knowledge Proofs**: Privacy-preserving transaction verification

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 9+
- PostgreSQL 15+
- Redis 7+
- WhatsApp Business API account
- Ethereum RPC provider (Alchemy/Infura)

### Installation

```bash
# Clone the repository
git clone https://github.com/compoundchat/compoundchat.git
cd compoundchat

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Development

```bash
# Run with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Lint and format
npm run lint
npm run format
```

## 📖 Usage

### User Commands

Once connected to WhatsApp, users can interact with these commands:

- **`help`** - Get started guide and available commands
- **`create wallet`** - Create a new non-custodial wallet
- **`balance`** - Check wallet balance and Compound positions
- **`supply [amount] [token]`** - Deposit crypto to earn interest (e.g., "supply 100 USDC")
- **`withdraw [amount] [token]`** - Withdraw from Compound (e.g., "withdraw 50 USDC")
- **`markets`** - View all available Compound markets and APYs

### Example Flow

```
User: "help"
Bot: "👋 Welcome to CompoundChat! ..."

User: "create wallet"
Bot: "✅ Wallet created! Your address: 0x1234...5678
      🔐 Save this recovery phrase: [24 words]"

User: "supply 100 USDC"
Bot: "✅ Supply Successful! Deposited: 100 USDC, APY: 4.2%"

User: "balance"
Bot: "💰 Your Balance
      USDC: 1,000.00 (4.2% APY)
      Interest earned: $12.50"
```

## 🏗️ Architecture

```
┌─────────────┐
│ WhatsApp    │
│ User        │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ WhatsApp Business API       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Webhook Server              │
│ - Signature verification    │
│ - Rate limiting             │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Command Handlers            │
│ - balance, supply, withdraw │
└─┬─────────────────────────┬─┘
  │                         │
  ▼                         ▼
┌──────────┐         ┌─────────────┐
│ Wallet   │         │ Compound V3 │
│ Layer    │         │ Integration │
└──────────┘         └─────────────┘
```

## 🔐 Security

CompoundChat is built with security as the top priority:

- **Non-custodial**: Users always control their private keys
- **Encrypted storage**: Private keys encrypted with AES-256-GCM
- **No plaintext keys**: Keys never stored or logged unencrypted
- **Webhook verification**: HMAC-SHA256 signature validation
- **Rate limiting**: Protection against abuse
- **Input validation**: All user inputs sanitized
- **Audit-ready**: Independent security review before launch

See [SECURITY.md](./docs/SECURITY.md) for our threat model and security architecture.

## 📊 Testing

We maintain high test coverage for all security-critical code:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage
```

**Coverage Requirements**:
- Security-critical code: **85%+ coverage**
- Overall codebase: **70%+ coverage**

## 🛣️ Roadmap

### ✅ Milestone 1 (Weeks 1-4) - Current
- [x] WhatsApp webhook integration
- [x] Non-custodial wallet creation
- [x] Compound V3 supply/withdraw
- [x] E2E encryption
- [x] Basic ZK proofs
- [ ] 30+ beta testers

### 🔜 Milestone 2 (Weeks 5-7)
- M-Pesa integration (Kenya, Tanzania, South Africa)
- MTN Mobile Money (Uganda, Ghana, Nigeria)
- 200+ active users
- $50K+ transaction volume

### 📅 Milestone 3 (Weeks 8-10)
- Borrowing functionality
- Real-time notifications
- Referral system
- 100+ borrowing positions

### 🚀 Milestone 4 (Weeks 11-14)
- Production launch
- 1,000+ users
- $400K+ TVL
- Marketing campaign

## 👥 Team

- **Beacher** [@0Xbeach](https://github.com/0Xbeach) - Cryptography & Security Lead
- **Bunny** - Mobile Money & Backend Specialist
- **Wisdom** - Smart Contract Integration Lead

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We're currently in private beta (Milestone 1). The repository will be open-sourced after Milestone 4.

For bug reports or security issues, please email: security@compoundchat.xyz

## 📞 Contact

- **Telegram**: [@0Xbeach](https://t.me/0Xbeach)
- **Twitter**: [@0Xbeachbuidler](https://twitter.com/0Xbeachbuidler)
- **Website**: compoundchat.xyz (coming soon)

## 🙏 Acknowledgments

- [Compound Labs](https://compound.finance/) for building accessible DeFi protocols
- [Ethereum Foundation](https://ethereum.org/) for the underlying blockchain technology
- African crypto communities for invaluable feedback and support

---

**Built with ❤️ for financial inclusion in Africa**
