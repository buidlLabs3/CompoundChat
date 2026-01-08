/**
 * Session Manager for Multi-Step Conversations
 * Handles state for commands that require follow-up responses
 */

export interface WithdrawSession {
  type: 'withdraw';
  amount: string;
  token: string;
  timestamp: number;
}

export interface PinSession {
  type: 'pin';
  action: 'supply' | 'withdraw' | 'borrow';
  amount: string;
  token: string;
  destinationAddress?: string;
  timestamp: number;
}

export type Session = WithdrawSession | PinSession;

// In-memory session storage (expires after 5 minutes)
const sessions = new Map<string, Session>();
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Set a session for a user
 */
export function setSession(userId: string, session: Session): void {
  sessions.set(userId, {
    ...session,
    timestamp: Date.now(),
  });
}

/**
 * Get a user's active session
 */
export function getSession(userId: string): Session | null {
  const session = sessions.get(userId);
  
  if (!session) {
    return null;
  }

  // Check if session has expired
  if (Date.now() - session.timestamp > SESSION_TIMEOUT) {
    clearSession(userId);
    return null;
  }

  return session;
}

/**
 * Clear a user's session
 */
export function clearSession(userId: string): void {
  sessions.delete(userId);
}

/**
 * Check if user has an active session
 */
export function hasActiveSession(userId: string): boolean {
  return getSession(userId) !== null;
}

/**
 * Clean up expired sessions (run periodically)
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [userId, session] of sessions.entries()) {
    if (now - session.timestamp > SESSION_TIMEOUT) {
      sessions.delete(userId);
    }
  }
}

// Clean up expired sessions every minute
setInterval(cleanupExpiredSessions, 60 * 1000);

