/**
 * Borrow command handler
 * Note: Current Sepolia config uses the USDC Comet base market only.
 * Borrowing base requires supported collateral (not enabled in this test setup).
 */

import { SEPOLIA_TOKENS } from '@compound/contracts';

export async function handleBorrow(
  _from: string,
  args: string[]
): Promise<string> {
  if (args.length < 2) {
    return `❌ Invalid format.\n\nUsage: *borrow [amount] [token]*\nExample: borrow 10 USDC`;
  }

  const token = args[1]?.toUpperCase() || '';
  const supported = Object.keys(SEPOLIA_TOKENS);

  if (!supported.includes(token)) {
    return `❌ Token ${token} not supported.\n\nSupported tokens: ${supported.join(', ')}`;
  }

  return (
    `ℹ️ Borrow is not enabled in this Sepolia test setup.\n` +
    `The current Comet market is USDC-base and collateral borrowing is disabled here.\n\n` +
    `To test borrowing:\n` +
    `• Supply eligible collateral in a collateral-enabled market\n` +
    `• Then borrow the base asset (e.g., USDC)\n\n` +
    `For now, please use *supply* and *withdraw* for USDC.`
  );
}


