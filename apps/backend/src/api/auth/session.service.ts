import { Injectable, Logger } from "@nestjs/common";

export interface SessionData {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number; // Unix timestamp
  codeVerifier?: string;
  state?: string;
  userInfo?: Record<string, unknown>;
}

/**
 * Simple in-memory session store for storing OIDC tokens and state.
 * In production, this should be replaced with a proper session store (Redis, database, etc.)
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessions = new Map<string, SessionData>();
  private readonly tempStates = new Map<
    string,
    { codeVerifier: string; state?: string; expiresAt: number }
  >();

  /**
   * Store temporary auth state (code verifier and state) before redirecting to OIDC provider
   */
  storeTempAuthState(
    sessionId: string,
    codeVerifier: string,
    state?: string,
  ): void {
    // Store for 10 minutes
    const expiresAt = Date.now() + 10 * 60 * 1000;
    this.tempStates.set(sessionId, { codeVerifier, state, expiresAt });
    this.logger.debug(`Stored temp auth state for session ${sessionId}`);
  }

  /**
   * Retrieve and remove temporary auth state
   */
  retrieveTempAuthState(sessionId: string): {
    codeVerifier: string;
    state?: string;
  } | null {
    const data = this.tempStates.get(sessionId);
    if (!data) {
      return null;
    }

    // Check if expired
    if (Date.now() > data.expiresAt) {
      this.tempStates.delete(sessionId);
      this.logger.debug(`Temp auth state expired for session ${sessionId}`);
      return null;
    }

    // Remove after retrieval
    this.tempStates.delete(sessionId);
    this.logger.debug(`Retrieved temp auth state for session ${sessionId}`);
    return { codeVerifier: data.codeVerifier, state: data.state };
  }

  /**
   * Store session data after successful authentication
   */
  storeSession(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, data);
    this.logger.debug(`Stored session for ${sessionId}`);
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if access token expired
    if (Date.now() > session.expiresAt) {
      this.logger.debug(`Session expired for ${sessionId}`);
      return null;
    }

    return session;
  }

  /**
   * Update session with refreshed tokens
   */
  updateSession(sessionId: string, data: Partial<SessionData>): void {
    const existing = this.sessions.get(sessionId);
    if (!existing) {
      this.logger.warn(`Attempted to update non-existent session ${sessionId}`);
      return;
    }

    this.sessions.set(sessionId, { ...existing, ...data });
    this.logger.debug(`Updated session for ${sessionId}`);
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.debug(`Deleted session for ${sessionId}`);
  }

  /**
   * Clean up expired sessions and temp states (should be called periodically)
   */
  cleanup(): void {
    const now = Date.now();

    // Clean expired sessions
    for (const [sessionId, data] of this.sessions.entries()) {
      if (now > data.expiresAt) {
        this.sessions.delete(sessionId);
        this.logger.debug(`Cleaned up expired session ${sessionId}`);
      }
    }

    // Clean expired temp states
    for (const [sessionId, data] of this.tempStates.entries()) {
      if (now > data.expiresAt) {
        this.tempStates.delete(sessionId);
        this.logger.debug(`Cleaned up expired temp state ${sessionId}`);
      }
    }
  }
}
