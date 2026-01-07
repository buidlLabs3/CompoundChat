/**
 * Help command handler
 */

export async function handleHelp(_from: string): Promise<string> {
  return `👋 *Welcome to CompoundChat!*

Earn interest on your crypto with Compound V3:

🔐 *create wallet* - Create a new wallet
💳 *my wallet* - View your wallet address

💰 *supply [amount] USDC* - Deposit to earn interest (Sepolia Comet USDC)
   Example: supply 10 USDC

💸 *withdraw [amount] USDC* - Withdraw your funds
   Example: withdraw 5 USDC

📊 *balance* - Check your wallet & earnings

📈 *markets* - View all lending markets & APYs

💸 *deposit* - Get your wallet address & MetaMask link to fund (use ETH for gas, swap ETH→USDC to supply)

❓ *help* - Show this message

_CompoundChat - DeFi for Everyone_ 🌍`;
}





