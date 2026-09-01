import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        name?: string;
        avatar?: string;
        role?: string;
        [key: string]: any;
      };
    }
  }
}

// Authorized admin emails - mirror client-side admin-auth list with env override support
const DEFAULT_ADMIN_EMAILS = [
  'nikelesh2006@gmail.com',
  'codecraft2k@gmail.com',
  'planetmini.care@gmail.com',
  'vimaljai1994@gmail.com',
];

export const AUTHORIZED_ADMIN_EMAILS: string[] = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  : DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());

/**
 * Checks whether an email address belongs to an authorized admin
 */
export function isEmailAdmin(email?: string): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Extracts and verifies JWT from cookies or Authorization header.
 * Fails closed without any hardcoded secret fallback or development backdoors.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Check cookies (jwt or auth_token)
  let token = req.cookies?.jwt || req.cookies?.auth_token;

  // 2. Check Authorization header: Bearer <token>
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. No valid token provided.',
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is not configured.');
    return res.status(500).json({
      error: 'Server Configuration Error',
      message: 'Authentication service is misconfigured.',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;

    const userId = decoded.id || decoded.sub || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token does not contain a valid user identifier.',
      });
    }

    req.user = {
      id: String(userId),
      sub: String(userId),
      email: decoded.email ? String(decoded.email).toLowerCase() : undefined,
      name: decoded.name || decoded.displayName,
      avatar: decoded.avatar || decoded.picture,
      role: decoded.role || (isEmailAdmin(decoded.email) ? 'admin' : 'user'),
    };

    next();
  } catch (err: any) {
    res.clearCookie('jwt');
    res.clearCookie('auth_token');

    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error: 'Unauthorized',
      message: isExpired ? 'Token has expired. Please log in again.' : 'Invalid token.',
    });
  }
}

/**
 * Middleware that requires the authenticated user to have admin authorization
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const verifyAdmin = () => {
    const userEmail = req.user?.email;

    if (!userEmail || !isEmailAdmin(userEmail)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrative privileges required for this resource.',
      });
    }

    next();
  };

  if (req.user) {
    verifyAdmin();
  } else {
    requireAuth(req, res, verifyAdmin);
  }
}
