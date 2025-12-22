# CompoundChat Setup Guide

## ✅ What's Built

Complete WhatsApp bot with Compound V3 integration on Sepolia testnet:

**Features:**
- Create non-custodial wallets (BIP39/BIP44)
- Check balance (wallet + Compound)
- Supply USDC to Compound
- Withdraw USDC from Compound
- View markets and APYs

**Commands:**
- `help` - Show available commands
- `create wallet` - Create new wallet
- `balance` - Check balances
- `supply 10 USDC` - Supply to Compound
- `withdraw 5 USDC` - Withdraw from Compound
- `markets` - View available markets

## 🚀 Quick Setup (5 minutes)

### 1. Environment Variables

Edit `.env`:
```bash
# Generate encryption keys
MASTER_ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
JWT_SECRET=<generate with: openssl rand -hex 32>

# Get from Alchemy (free tier)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# WhatsApp Business API (from Meta)
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### 2. Run the Bot

```bash
# Build
npm run build

# Start
npm start

# Or development mode with hot reload
npm run dev
```

Server runs on `http://localhost:3000`

### 3. Expose Webhook (Development)

```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok

# Start tunnel
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 4. Configure WhatsApp Webhook

1. Go to Meta Developer Console: https://developers.facebook.com/apps
2. Select your app → WhatsApp → Configuration
3. Add webhook URL: `https://your-ngrok-url.ngrok.io/webhook`
4. Verify token: (value from `WHATSAPP_WEBHOOK_SECRET`)
5. Subscribe to: `messages`

## 📱 Testing on WhatsApp

1. Send message to your WhatsApp Business number
2. Bot responds to commands:
   - `help` - See all commands
   - `create wallet` - Get your wallet
   - `balance` - Check funds

## 💰 Get Testnet Funds

1. **Sepolia ETH** (for gas):
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia

2. **Sepolia USDC** (for testing):
   - Contract: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
   - Ask in Compound Discord for testnet USDC

## 🔧 Architecture

```
WhatsApp → Meta API → Your Webhook → Express Server
                                        ↓
                              Command Handlers
                                        ↓
                      Wallet (encrypted) + Compound V3
                                        ↓
                                  Sepolia Testnet
```

## 📊 What Works

✅ Wallet creation with BIP39/BIP44
✅ Private key encryption (AES-256-GCM)
✅ Balance checking (wallet + Compound)
✅ Supply to Compound V3
✅ Withdraw from Compound V3
✅ Real Compound contracts on Sepolia
✅ Webhook security (signature verification)
✅ Rate limiting
✅ Structured logging

## 🚧 Production Checklist

Before mainnet:
- [ ] Replace memory store with PostgreSQL
- [ ] Add Redis for sessions
- [ ] Deploy to AWS/DigitalOcean
- [ ] Use mainnet Compound contracts
- [ ] Security audit
- [ ] Load testing
- [ ] Backup strategy

## 📝 Notes

- Currently uses **Sepolia testnet** (safe for testing)
- Wallets stored in **memory** (restart = lost data)
- Only **USDC** supported currently
- No mobile money integration yet (Milestone 2)

## 🆘 Troubleshooting

**Build fails:** Check TypeScript errors with `npm run typecheck`

**Webhook not receiving:** Verify ngrok URL and Meta webhook config

**Transactions fail:** Check you have Sepolia ETH for gas

**"Wallet not found":** Create wallet first with `create wallet`


