/**
 * Message handler and command router
 */

import { logger, maskPhoneNumber } from '@utils/logger';
import { sendWhatsAppMessage } from './whatsapp-client';
import { handleHelp } from './handlers/help';
import { handleBalance } from './handlers/balance';
import { handleSupply } from './handlers/supply';
import { handleWithdraw } from './handlers/withdraw';
import { handleMarkets } from './handlers/markets';
import { handleCreateWallet } from './handlers/create-wallet';
import { handleWalletInfo } from './handlers/wallet';
import { handleDeposit } from './handlers/deposit';
import { handleBorrow } from './handlers/borrow';
import { handleImportWallet } from './handlers/import-wallet';
import { handleWithdrawAddress } from './handlers/handle-withdraw-address';
import { getSession, clearSession } from './session-manager';

interface ParsedCommand {
  action: string;
  args: string[];
}

function parseCommand(message: string): ParsedCommand {
  const normalized = message.toLowerCase().trim();
  const parts = normalized.split(/\s+/);
  const action = parts[0] || '';
  const args = parts.slice(1);

  // Handle natural language variations
  const commandMap: Record<string, string> = {
    help: 'help',
    start: 'help',
    hi: 'help',
    hello: 'help',
    balance: 'balance',
    bal: 'balance',
    'check balance': 'balance',
    supply: 'supply',
    lend: 'supply',
    withdraw: 'withdraw',
    'take out': 'withdraw',
    send: 'withdraw',
    borrow: 'borrow',
    loan: 'borrow',
    markets: 'markets',
    market: 'markets',
    apy: 'markets',
    'create wallet': 'create',
    'new wallet': 'create',
    create: 'create',
    'import wallet': 'import',
    import: 'import',
    'my wallet': 'wallet',
    'wallet info': 'wallet',
    wallet: 'wallet',
    address: 'wallet',
    deposit: 'deposit',
    fund: 'deposit',
    topup: 'deposit',
  };

  return {
    action: commandMap[action] || commandMap[normalized] || 'unknown',
    args,
  };
}

export async function handleMessage(
  from: string,
  messageBody: string
): Promise<void> {
  const trimmedMessage = messageBody.trim();

  // Check if user wants to cancel an active session
  if (trimmedMessage.toLowerCase() === 'cancel') {
    const session = getSession(from);
    if (session) {
      clearSession(from);
      await sendWhatsAppMessage(from, '❌ Request cancelled.\n\nType *help* to see available commands.');
      return;
    }
  }

  // Check for active sessions first
  const session = getSession(from);
  if (session) {
    logger.info('Active session detected', {
      from: maskPhoneNumber(from),
      sessionType: session.type,
    });

    let response: string;

    try {
      if (session.type === 'withdraw') {
        // User is expected to provide an address
        // Handle special cases: "my wallet" means send to their own wallet
        if (trimmedMessage.toLowerCase() === 'my wallet') {
          const wallet = await (await import('@database/index')).database.getWallet(from);
          if (wallet) {
            response = await handleWithdrawAddress(from, wallet.address, session);
          } else {
            clearSession(from);
            response = `❌ You don't have a wallet yet.\n\nType *create wallet* to get started.`;
          }
        } else {
          // Treat the message as an address
          response = await handleWithdrawAddress(from, trimmedMessage, session);
        }
        await sendWhatsAppMessage(from, response);
        return;
      }
    } catch (error) {
      logger.error('Error handling session', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        from: maskPhoneNumber(from),
      });
      clearSession(from);
      await sendWhatsAppMessage(
        from,
        'Sorry, something went wrong. Please try again later.'
      );
      return;
    }
  }

  // No active session, parse as normal command
  const { action, args } = parseCommand(messageBody);

  logger.info('Processing command', {
    from: maskPhoneNumber(from),
    action,
  });

  let response: string;

  try {
    switch (action) {
      case 'help':
        response = await handleHelp(from);
        break;
      case 'create':
        response = await handleCreateWallet(from);
        break;
      case 'import':
        response = await handleImportWallet(from, args);
        break;
      case 'wallet':
        response = await handleWalletInfo(from);
        break;
      case 'deposit':
        response = await handleDeposit(from);
        break;
      case 'balance':
        response = await handleBalance(from);
        break;
      case 'supply':
        response = await handleSupply(from, args);
        break;
      case 'withdraw':
        response = await handleWithdraw(from, args);
        break;
      case 'borrow':
        response = await handleBorrow(from, args);
        break;
      case 'markets':
        response = await handleMarkets(from);
        break;
      default:
        response = `I didn't understand that command. Type *help* to see what I can do.`;
    }

    await sendWhatsAppMessage(from, response);
  } catch (error) {
    logger.error('Error handling message', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      from: maskPhoneNumber(from) 
    });
    await sendWhatsAppMessage(
      from,
      'Sorry, something went wrong. Please try again later.'
    );
  }
}





