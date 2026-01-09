/**
 * Help command handler
 */

export async function handleHelp(_from: string): Promise<string> {
  return `👋 *Welcome to CompoundChat!*

Earn interest on your crypto with Compound V3:

🔐 *create wallet* - Create a new wallet
🛠️ *import wallet [mnemonic]* - Import an existing wallet
💳 *my wallet* - View your wallet address

💰 *supply [amount] USDC* - Deposit to Compound to earn interest
   Example: supply 10 USDC

💸 *withdraw [amount] USDC* - Withdraw from Compound (asks where to send)
   Example: withdraw 5 USDC
   • Bot asks: your wallet or external address

💼 *withdraw earnings [amount] USDC* - Withdraw to YOUR wallet
   Example: withdraw earnings 1 USDC
   • Goes directly to your wallet

📤 *send [amount] [token]* - Send from YOUR wallet to external
   Example: send 0.01 ETH to 0xabc...
   • Supports: ETH, USDC

💳 *borrow [amount] USDC* - (Not available on this Sepolia Comet)

📊 *balance* - Check your wallet & earnings

📈 *markets* - View all lending markets & APYs

💸 *deposit* - Get your wallet address & MetaMask link to fund (use ETH for gas, swap ETH→USDC to supply)

❓ *help* - Show this message

_CompoundChat - DeFi for Everyone_ 🌍`;
}





