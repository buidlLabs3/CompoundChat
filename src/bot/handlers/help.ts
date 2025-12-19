/**
 * Help command handler
 */

export async function handleHelp(_from: string): Promise<string> {
  return `👋 *Welcome to CompoundChat!*

Earn interest on your crypto with Compound V3:

💰 *supply [amount] [token]* - Deposit to earn interest
   Example: supply 100 USDC

💸 *withdraw [amount] [token]* - Withdraw your funds
   Example: withdraw 50 USDC

📊 *balance* - Check your wallet & earnings

📈 *markets* - View all lending markets & APYs

🔐 *create wallet* - Create a new wallet

❓ *help* - Show this message

_CompoundChat - DeFi for Everyone_ 🌍`;
}

