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
    const isAuthorizedAdmin = isEmailAdmin(userEmail) || req.user?.role === 'admin';

    if (!isAuthorizedAdmin) {
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

/**
 * Helper to verify an admin PIN JWT token string.
 */
export function verifyAdminPinToken(
  token?: string,
  expectedEmail?: string
): { valid: boolean; error?: string; remainingSeconds?: number } {
  if (!token) {
    return { valid: false, error: 'No Admin PIN token provided.' };
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return { valid: false, error: 'Server configuration error.' };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    if (decoded?.pinVerified !== true || decoded?.purpose !== 'admin_pin_verification') {
      return { valid: false, error: 'Invalid PIN verification token purpose.' };
    }

    if (
      expectedEmail &&
      decoded.email &&
      decoded.email.toLowerCase().trim() !== expectedEmail.toLowerCase().trim()
    ) {
      return { valid: false, error: 'Admin PIN token email does not match authenticated user.' };
    }

    const remainingSeconds = decoded.exp
      ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
      : 0;

    return { valid: true, remainingSeconds };
  } catch (err: any) {
    const isExpired = err.name === 'TokenExpiredError';
    return {
      valid: false,
      error: isExpired ? 'Admin PIN verification has expired.' : 'Invalid Admin PIN token.',
    };
  }
}

/**
 * Middleware that requires the authenticated user to be an admin AND
 * have completed secondary 6-digit Admin PIN verification.
 */
export function requireAdminPinVerification(req: Request, res: Response, next: NextFunction) {
  const proceedToPinCheck = () => {
    // 1. Extract admin_pin_token from cookie or custom header
    let pinToken = req.cookies?.admin_pin_token;
    if (!pinToken) {
      const headerVal = req.headers['x-admin-pin-token'];
      if (typeof headerVal === 'string') {
        pinToken = headerVal.trim();
      }
    }

    if (!pinToken) {
      return res.status(403).json({
        error: 'Admin Verification Required',
        code: 'ADMIN_PIN_VERIFICATION_REQUIRED',
        message:
          'Secondary 6-digit Admin PIN verification required. Please press Ctrl + Shift + A or enter your PIN.',
      });
    }

    const verification = verifyAdminPinToken(pinToken, req.user?.email);
    if (!verification.valid) {
      // Clear expired or invalid pin token cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('admin_pin_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
      });

      return res.status(403).json({
        error: 'Admin Verification Required',
        code: 'ADMIN_PIN_VERIFICATION_REQUIRED',
        message: verification.error || 'Admin PIN verification expired or invalid. Please re-enter your PIN.',
      });
    }

    // Attach verified flag to request object
    (req as any).adminPinVerified = true;
    next();
  };

  // Ensure caller is an authenticated admin first
  requireAdmin(req, res, proceedToPinCheck);
}
