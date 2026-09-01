// Authentication, Rate Limiting & Session Management
// Conforms to Mikyaj Engineering Specification Rev. 5 (§13, DEC-016, DEC-017, DEC-018, DEC-019)

import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { User, Role } from './types';

// Rate Limiter: 10 requests / minute / IP (DEC-016, NFR-SEC-06, AUD-10)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute

  const current = ipRequestCounts.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > current.resetAt) {
    current.count = 1;
    current.resetAt = now + windowMs;
  } else {
    current.count += 1;
  }

  ipRequestCounts.set(ip, current);

  if (current.count > 10) {
    return sendStandardError(res, 429, 'RATE_LIMITED', 'Too many requests. Please try again in 1 minute.');
  }

  next();
}

// Standard Error Response Shape (DEC-039, §12.1)
export function sendStandardError(
  res: Response, 
  status: number, 
  code: string, 
  message: string, 
  details: Record<string, any> = {}
) {
  const requestId = `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  return res.status(status).json({
    error: {
      code,
      message,
      details,
      requestId
    }
  });
}

export interface SessionData {
  userId: string;
  role: Role;
  name: string;
  email: string;
  isOwner: boolean;
  expiresAt: number;
}

// In-memory active session token store
const activeSessions = new Map<string, SessionData>();

export function createSession(user: User, isOwner: boolean = false): { token: string; session: SessionData } {
  const token = `mikyaj_sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  // 7 days for customer (DEC-017), 8 hours for admin (DEC-019)
  const durationMs = user.role === 'CUSTOMER' ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  
  const session: SessionData = {
    userId: user.id,
    role: user.role,
    name: user.email?.split('@')[0] || 'User',
    email: user.email || '',
    isOwner: user.role === 'OWNER' || isOwner,
    expiresAt: Date.now() + durationMs
  };

  activeSessions.set(token, session);
  return { token, session };
}

export function validateSession(token?: string): SessionData | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

export function revokeSession(token?: string) {
  if (token) activeSessions.delete(token);
}

// Authentication Middleware
export function requireAuth(roles?: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.mikyaj_session || req.headers.authorization?.replace('Bearer ', '');
    const session = validateSession(token);

    if (!session) {
      return sendStandardError(res, 401, 'AUTH_REQUIRED', 'Authentication session required.');
    }

    if (roles && !roles.includes(session.role)) {
      return sendStandardError(res, 403, 'FORBIDDEN', 'You do not have permission to access this resource.');
    }

    (req as any).userSession = session;
    next();
  };
}
