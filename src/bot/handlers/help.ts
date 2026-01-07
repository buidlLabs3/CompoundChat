/**
 * Help command handler
 */

export async function handleHelp(_from: string): Promise<string> {
  return `👋 *Welcome to CompoundChat!*

Earn interest on your crypto with Compound V3:

🔐 *create wallet* - Create a new wallet
💳 *my wallet* - View your wallet address

💰 *supply [amount] [token]* - Deposit to earn interest
   Example: supply 0.01 ETH (tokens: ETH, WETH, USDC)

💸 *withdraw [amount] [token]* - Withdraw your funds
   Example: withdraw 0.005 ETH (tokens: ETH, WETH, USDC)

📊 *balance* - Check your wallet & earnings

📈 *markets* - View all lending markets & APYs

💸 *deposit* - Get your wallet address & MetaMask link to fund

❓ *help* - Show this message

_CompoundChat - DeFi for Everyone_ 🌍`;
}





