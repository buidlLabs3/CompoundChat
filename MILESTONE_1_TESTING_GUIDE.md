# CompoundChat Milestone 1 - Testing Guide

**Version:** 1.0  
**Network:** Sepolia Testnet  
**Date:** January 7, 2026

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Help Command](#2-help-command)
3. [Create Wallet](#3-create-wallet)
4. [View Wallet](#4-view-wallet)
5. [Import Wallet](#5-import-wallet)
6. [Deposit Funds](#6-deposit-funds)
7. [Check Balance](#7-check-balance)
8. [View Markets](#8-view-markets)
9. [Supply to Compound](#9-supply-to-compound)
10. [Withdraw from Compound](#10-withdraw-from-compound)
11. [External On-Chain Withdrawal](#11-external-on-chain-withdrawal)

---

## 1. Getting Started

### Prerequisites
- WhatsApp installed on your device
- Access to CompoundChat bot via WhatsApp number: **+1 (555) 168-3551**
- Sepolia testnet ETH for gas (get from faucet)
- Sepolia USDC for supply operations

### Initial Setup
Start a conversation with the bot by sending any message.

**📸 Screenshot 1:** Initial message to bot  
*Show: Your first message to +1 (555) 168-3551*

---

## 2. Help Command

### Command
```
help
```

### Description
Displays all available commands and features in CompoundChat.

### Expected Response
```
👋 Welcome to CompoundChat!

Earn interest on your crypto with Compound V3:

🔐 create wallet - Create a new wallet
🛠️ import wallet [mnemonic] - Import an existing wallet
💳 my wallet - View your wallet address

💰 supply [amount] USDC - Deposit to earn interest (Sepolia Comet USDC)
   Example: supply 10 USDC

💸 withdraw [amount] USDC - Withdraw your funds
   Example: withdraw 5 USDC
   
💸 withdraw [amount] USDC to [address] - Send to external wallet
   Example: withdraw 5 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

💳 borrow [amount] USDC - (Disabled on this Sepolia setup; see note)

📊 balance - Check your wallet & earnings

📈 markets - View all lending markets & APYs

💸 deposit - Get your wallet address & MetaMask link to fund

❓ help - Show this message

CompoundChat - DeFi for Everyone 🌍
```

**📸 Screenshot 2:** Help command response  
*Show: Full help menu displayed in WhatsApp*

---

## 3. Create Wallet

### Command
```
create wallet
```

### Description
Creates a new non-custodial Ethereum wallet with BIP39 mnemonic (24 words) and encrypted private key storage.

### Expected Response
```
✅ Wallet Created Successfully!

💼 Your Address:
0xeD45711F4D9D235c0125400BCf431b11a0eB9c65

🔐 SAVE YOUR RECOVERY PHRASE:
connect crystal recipe orient absent celery live sad grocery sight wire use gold kiwi shell knife grit click book couple theory near lawsuit alter

🔒 Encrypted Backup:
Passphrase: bravo-bravo-hotel-foxtrot-alpha-foxtrot
(Use this to recover if you lose your phrase)

⚠️ Security:
• Write down the 24 words on paper
• Save the passphrase separately
• NEVER share with anyone
• CompoundChat can't recover lost phrases

📱 Next Steps:
1. Get Sepolia testnet USDC (faucet)
2. Type balance to check funds
3. Type supply 10 USDC to start earning

Sepolia Testnet - Safe for Testing 🧪
```

**📸 Screenshot 3:** Wallet creation response  
*Show: Wallet address, mnemonic (redacted in actual docs), and security instructions*

### Important Notes
- ⚠️ **Save your 24-word mnemonic immediately** - it's the only way to recover your wallet
- ⚠️ **Never share your mnemonic** with anyone
- ✅ The wallet persists across server restarts (stored in encrypted file)
- ✅ Only one wallet per phone number (prevents accidental overwrites)

**📸 Screenshot 4:** Attempting to create a second wallet  
*Show: Error message "You already have a wallet!"*

---

## 4. View Wallet

### Command
```
my wallet
```

### Description
Displays your wallet address with a link to view it on Sepolia Etherscan.

### Expected Response
```
🔐 Your Wallet

📍 Address:
0xeD45711F4D9D235c0125400BCf431b11a0eB9c65

💡 Tip: Copy this address to receive funds or view on Etherscan:
https://sepolia.etherscan.io/address/0xeD45711F4D9D235c0125400BCf431b11a0eB9c65

⚠️ Keep your 24-word recovery phrase safe! Never share it with anyone.
```

**📸 Screenshot 5:** My wallet response  
*Show: Wallet address and Etherscan link*

---

## 5. Import Wallet

### Command
```
import wallet [24-word mnemonic phrase]
```

### Example
```
import wallet connect crystal recipe orient absent celery live sad grocery sight wire use gold kiwi shell knife grit click book couple theory near lawsuit alter
```

### Description
Imports an existing wallet using a BIP39 mnemonic phrase. Useful for wallet recovery or migration.

### Expected Response (Success)
```
✅ Wallet Imported Successfully!

💼 Your Address:
0xeD45711F4D9D235c0125400BCf431b11a0eB9c65

🔒 Encrypted Backup:
Passphrase: charlie-delta-echo-foxtrot-golf-hotel
(Use this to recover if you lose your phrase)

⚠️ Your wallet is now secured and persistent.

Type balance to check your funds.
```

**📸 Screenshot 6:** Import wallet success  
*Show: Successful import with wallet address*

### Error Cases

**Invalid mnemonic:**
```
❌ Invalid mnemonic phrase.

Please provide a valid 12 or 24-word BIP39 mnemonic phrase.
```

**📸 Screenshot 7:** Import wallet error  
*Show: Error message for invalid mnemonic*

---

## 6. Deposit Funds

### Command
```
deposit
```

### Description
Shows your wallet address with MetaMask deep links to easily send ETH and USDC from mobile wallets.

### Expected Response
```
💰 Deposit Funds

📍 Your Wallet Address:
0xeD45711F4D9D235c0125400BCf431b11a0eB9c65

🦊 Quick Deposit via MetaMask:
• ETH (for gas): [MetaMask Link]
https://metamask.app.link/send/0xeD45711F4D9D235c0125400BCf431b11a0eB9c65@11155111

• USDC (to supply): [MetaMask Link]
https://metamask.app.link/send/0xeD45711F4D9D235c0125400BCf431b11a0eB9c65@11155111/transfer?address=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

💡 Tips:
• Keep some ETH for gas fees
• Get Sepolia testnet USDC to supply to Compound
• Faucets: Alchemy, QuickNode, Infura (for ETH)

Sepolia Testnet
```

**📸 Screenshot 8:** Deposit command response  
*Show: Wallet address and MetaMask deep links*

### Funding Steps
1. Get Sepolia ETH from faucet: https://www.alchemy.com/faucets/ethereum-sepolia
2. Swap some ETH → USDC on a Sepolia DEX or use USDC faucet
3. Verify funds with `balance` command

**📸 Screenshot 9:** Funded wallet on Etherscan  
*Show: Sepolia Etherscan showing ETH and USDC balance*

---

## 7. Check Balance

### Command
```
balance
```

### Description
Displays your wallet balances (ETH, USDC) and Compound supplied balances.

### Expected Response (Before Supply)
```
💰 Your Balance

💼 Wallet: 0xeD45...9c65

In Wallet:
• 0.0090 ETH
• 1.00 USDC

Sepolia Testnet
```

**📸 Screenshot 10:** Balance before supply  
*Show: Wallet balance with ETH and USDC*

### Expected Response (After Supply)
```
💰 Your Balance

💼 Wallet: 0xeD45...9c65

In Wallet:
• 0.0089 ETH
• 0.80 USDC

On Compound (Earning): 📈
• 0.20 USDC
• APY: ~4.2% (estimated)

Sepolia Testnet
```

**📸 Screenshot 11:** Balance after supply  
*Show: Wallet balance + Compound supplied balance*

---

## 8. View Markets

### Command
```
markets
```

### Description
Displays available Compound V3 markets with current APY rates on Sepolia testnet.

### Expected Response
```
📈 Compound V3 Markets (Sepolia)

USDC Market
• Supply APY: ~4.2%
• Protocol: Compound V3 (Comet)
• Network: Sepolia Testnet

💡 Supply USDC to start earning interest automatically!

Type supply 10 USDC to get started.
```

**📸 Screenshot 12:** Markets command response  
*Show: Available markets and APY rates*

---

## 9. Supply to Compound

### Command
```
supply [amount] USDC
```

### Example
```
supply 0.2 USDC
```

### Description
Supplies USDC to Compound V3 Sepolia market to start earning interest. The bot handles:
1. Token approval (MAX allowance for future supplies)
2. Supply transaction to Comet contract

### Expected Response (Success)
```
✅ Supply Successful!

💰 Deposited: 0.2 USDC
📈 APY: ~4.2% (estimated)

🔗 Transaction:
https://sepolia.etherscan.io/tx/0x3fe2caec360e0ea544ea9c3d91e485d7c236f5d02f7053685bce4be355390829

Your USDC is now earning interest on Compound!

Type balance to see your updated balance.
```

**📸 Screenshot 13:** Supply success response  
*Show: Success message with transaction link*

**📸 Screenshot 14:** Supply transaction on Etherscan  
*Show: Sepolia Etherscan transaction details*

### Transaction Flow
1. **Approval Transaction**: Approves Comet contract to spend USDC (one-time, MAX allowance)
2. **Supply Transaction**: Transfers USDC to Compound V3 Comet

**📸 Screenshot 15:** Multiple supplies without re-approval  
*Show: Second supply completing faster (no approval needed)*

### Error Cases

**Insufficient balance:**
```
❌ Insufficient USDC. You have 0.5 but tried to supply 1.0
```

**📸 Screenshot 16:** Insufficient balance error  
*Show: Error message when trying to supply more than available*

---

## 10. Withdraw from Compound

### Command
```
withdraw [amount] USDC
```

### Example
```
withdraw 0.1 USDC
```

### Description
Withdraws USDC from Compound V3 back to your wallet.

### Expected Response (Success)
```
✅ Withdrawal Successful!

💸 Withdrew: 0.1 USDC

🔗 Transaction:
https://sepolia.etherscan.io/tx/0x...

Funds are back in your wallet!

Type balance to see your updated balance.
```

**📸 Screenshot 17:** Withdraw success response  
*Show: Success message with transaction link*

**📸 Screenshot 18:** Withdraw transaction on Etherscan  
*Show: Sepolia Etherscan transaction details*

### Error Cases

**Insufficient Compound balance:**
```
❌ Insufficient USDC on Compound. You have 0.05 but tried to withdraw 0.1
```

**📸 Screenshot 19:** Insufficient Compound balance error  
*Show: Error when trying to withdraw more than supplied*

---

## 11. External On-Chain Withdrawal

### Command
```
withdraw [amount] USDC to [destination_address]
```

### Example
```
withdraw 0.05 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Description
Withdraws USDC from Compound and sends it directly to an external Ethereum address. Useful for sending funds to another wallet or exchange.

### Expected Response (Success)
```
✅ Withdrawal & Transfer Successful!

💸 Withdrew: 0.05 USDC from Compound
📤 Sent to: 0x742d...0bEb

🔗 Compound Withdraw:
https://sepolia.etherscan.io/tx/0x...

🔗 Transfer Transaction:
https://sepolia.etherscan.io/tx/0x...

Funds sent successfully!

Type balance to see your updated balance.
```

**📸 Screenshot 20:** External withdrawal success  
*Show: Success message with both transaction links*

**📸 Screenshot 21:** Both transactions on Etherscan  
*Show: Withdraw tx and transfer tx confirmed on Sepolia Etherscan*

### Error Cases

**Invalid address:**
```
❌ Invalid destination address.

Please provide a valid Ethereum address (0x...).
```

**📸 Screenshot 22:** Invalid address error  
*Show: Error message for malformed address*

---

## Milestone 1 Feature Checklist

### Core Features ✅
- [x] WhatsApp Bot Integration (webhook, message handling)
- [x] Non-custodial Wallet Creation (BIP39/BIP44)
- [x] Wallet Import/Recovery (mnemonic)
- [x] Encrypted Private Key Storage (persistent file storage)
- [x] E2E Mnemonic Encryption (passphrase backup)
- [x] Compound V3 Supply (USDC on Sepolia)
- [x] Compound V3 Withdraw (USDC on Sepolia)
- [x] Balance Checking (wallet + Compound)
- [x] Market Data Display (APY rates)
- [x] Deposit Helper (MetaMask deep links)
- [x] External On-Chain Withdrawal
- [x] Help Command (all commands listed)

### Security Features ✅
- [x] Webhook Signature Verification
- [x] Rate Limiting
- [x] AES-256-GCM Encryption for private keys
- [x] Secure mnemonic handling (never stored)
- [x] One wallet per phone number
- [x] Phone number masking in logs

### User Experience ✅
- [x] Clear command structure
- [x] Helpful error messages
- [x] Transaction links (Etherscan)
- [x] Balance formatting (readable decimals)
- [x] Mobile-optimized responses

---

## Technical Details

### Network Information
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Comet Contract**: `0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e`
- **USDC Token**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Block Explorer**: https://sepolia.etherscan.io

### Wallet Derivation
- **Standard**: BIP44
- **Path**: `m/44'/60'/0'/0/0`
- **Mnemonic**: 24 words (256-bit entropy)

### Storage
- **Type**: File-based (`.data/wallets.json`)
- **Encryption**: AES-256-GCM
- **Persistence**: Survives server restarts

---

## Testing Summary

### Successful Test Scenarios
1. ✅ Created wallet and received 24-word mnemonic
2. ✅ Viewed wallet address and Etherscan link
3. ✅ Funded wallet with Sepolia ETH and USDC
4. ✅ Checked balance (wallet + Compound)
5. ✅ Supplied 0.2 USDC to Compound
6. ✅ Balance showed supplied amount earning interest
7. ✅ Withdrew 0.1 USDC from Compound to wallet
8. ✅ External withdrawal to different address
9. ✅ All transactions confirmed on Sepolia Etherscan
10. ✅ Wallet persisted after server restart

### Known Limitations (Not in Milestone 1)
- Borrowing not available (requires collateral-enabled Comet)
- PIN authentication for withdrawals (planned for Milestone 2)
- Mobile money integration (planned for Milestone 2)
- PostgreSQL database (using file storage for MVP)

---

## Conclusion

CompoundChat Milestone 1 is **complete** and **fully functional** on Sepolia testnet. All core features have been implemented and tested:

- ✅ Non-custodial wallet creation and import
- ✅ Persistent encrypted storage
- ✅ Compound V3 supply and withdraw
- ✅ External on-chain withdrawals
- ✅ WhatsApp bot integration
- ✅ Security features (encryption, signature verification, rate limiting)

**Next Steps for Milestone 2:**
- PIN authentication
- Mobile money integration (M-Pesa, etc.)
- PostgreSQL database migration
- Borrowing on collateral-enabled markets
- Additional security features

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Tested By:** CompoundChat Team  
**Network:** Sepolia Testnet

