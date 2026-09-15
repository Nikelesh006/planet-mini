import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  requireAuth,
  requireAdmin,
  requireAdminPinVerification,
  verifyAdminPinToken,
} from '../lib/authMiddleware.js';
import { adminPinLimiter, adminPinChangeLimiter } from '../lib/rateLimiters.js';
import {
  verifyAdminPinRecord,
  updateAdminPinRecord,
  ADMIN_PIN_SESSION_MINUTES,
} from '../models/AdminSecurity.js';
import { logAdminSecurityEvent } from '../models/AdminAuditLog.js';

const router = express.Router();

/**
 * POST /api/admin/security/verify-pin
 * Validates the 6-digit Admin PIN, enforces rate limiting & lockouts,
 * and sets an HttpOnly admin_pin_token cookie on success.
 */
router.post(
  '/verify-pin',
  requireAuth,
  requireAdmin,
  adminPinLimiter,
  async (req: Request, res: Response) => {
    try {
      const { pin } = req.body || {};
      const adminEmail = req.user?.email || 'unknown';
      const adminUserId = req.user?.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      if (!pin || typeof pin !== 'string') {
        return res.status(400).json({
          success: false,
          error: '6-digit Admin PIN is required.',
        });
      }

      const cleanPin = pin.trim();
      const verification = await verifyAdminPinRecord(cleanPin);

      if (!verification.success) {
        if (verification.lockedOut) {
          await logAdminSecurityEvent({
            adminEmail,
            adminUserId,
            event: 'ADMIN_PIN_LOCKOUT',
            result: 'BLOCKED',
            ipAddress,
            userAgent,
            details: { remainingMinutes: verification.remainingMinutes },
          });

          return res.status(429).json({
            success: false,
            lockedOut: true,
            error: verification.error,
          });
        }

        await logAdminSecurityEvent({
          adminEmail,
          adminUserId,
          event: 'ADMIN_PIN_VERIFICATION_FAILURE',
          result: 'FAILURE',
          ipAddress,
          userAgent,
          details: { remainingAttempts: verification.remainingAttempts },
        });

        return res.status(401).json({
          success: false,
          error: verification.error || 'Incorrect Admin PIN.',
          remainingAttempts: verification.remainingAttempts,
        });
      }

      // PIN is correct: generate short-lived signed verification token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error: JWT_SECRET missing.',
        });
      }

      const sessionDurationMinutes = ADMIN_PIN_SESSION_MINUTES;
      const expiresAt = new Date(Date.now() + sessionDurationMinutes * 60 * 1000);

      const pinToken = jwt.sign(
        {
          sub: adminUserId,
          email: adminEmail,
          pinVerified: true,
          purpose: 'admin_pin_verification',
        },
        jwtSecret,
        { expiresIn: `${sessionDurationMinutes}m` }
      );

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('admin_pin_token', pinToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: sessionDurationMinutes * 60 * 1000,
        path: '/',
      });

      await logAdminSecurityEvent({
        adminEmail,
        adminUserId,
        event: 'ADMIN_PIN_VERIFICATION_SUCCESS',
        result: 'SUCCESS',
        ipAddress,
        userAgent,
        details: { sessionMinutes: sessionDurationMinutes },
      });

      return res.json({
        success: true,
        verified: true,
        token: pinToken,
        expiresAt: expiresAt.toISOString(),
        expiresInMinutes: sessionDurationMinutes,
      });
    } catch (err) {
      console.error('Admin PIN verification error:', err);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during PIN verification.',
      });
    }
  }
);

/**
 * GET /api/admin/security/status
 * Returns current admin PIN verification status without exposing secrets.
 */
router.get(
  '/status',
  requireAuth,
  requireAdmin,
  (req: Request, res: Response) => {
    let pinToken = req.cookies?.admin_pin_token;
    if (!pinToken) {
      const headerVal = req.headers['x-admin-pin-token'];
      if (typeof headerVal === 'string') {
        pinToken = headerVal.trim();
      }
    }

    if (!pinToken) {
      return res.json({
        isAuthenticated: true,
        isAdmin: true,
        isPinVerified: false,
        remainingSeconds: 0,
      });
    }

    const verification = verifyAdminPinToken(pinToken, req.user?.email);
    if (!verification.valid) {
      return res.json({
        isAuthenticated: true,
        isAdmin: true,
        isPinVerified: false,
        remainingSeconds: 0,
      });
    }

    return res.json({
      isAuthenticated: true,
      isAdmin: true,
      isPinVerified: true,
      remainingSeconds: verification.remainingSeconds || 0,
    });
  }
);

/**
 * POST /api/admin/security/change-pin
 * Allows an authenticated and PIN-verified administrator to change the 6-digit PIN.
 */
router.post(
  '/change-pin',
  requireAuth,
  requireAdmin,
  requireAdminPinVerification,
  adminPinChangeLimiter,
  async (req: Request, res: Response) => {
    try {
      const { currentPin, newPin, confirmPin } = req.body || {};
      const adminEmail = req.user?.email || 'admin';
      const ipAddress = req.ip || req.socket.remoteAddress;

      if (!currentPin || !newPin || !confirmPin) {
        return res.status(400).json({
          success: false,
          error: 'Current PIN, new PIN, and confirmation PIN are required.',
        });
      }

      if (newPin !== confirmPin) {
        return res.status(400).json({
          success: false,
          error: 'New PIN and confirmation PIN do not match.',
        });
      }

      // Verify current PIN
      const currentVerification = await verifyAdminPinRecord(String(currentPin).trim());
      if (!currentVerification.success) {
        return res.status(401).json({
          success: false,
          error: 'Current Admin PIN is incorrect.',
        });
      }

      // Update PIN
      const updateResult = await updateAdminPinRecord(String(newPin).trim(), adminEmail);
      if (!updateResult.success) {
        return res.status(400).json({
          success: false,
          error: updateResult.error || 'Failed to update Admin PIN.',
        });
      }

      await logAdminSecurityEvent({
        adminEmail,
        adminUserId: req.user?.id,
        event: 'ADMIN_PIN_CHANGED',
        result: 'SUCCESS',
        ipAddress,
        userAgent: req.headers['user-agent'],
      });

      return res.json({
        success: true,
        message: 'Admin PIN changed successfully.',
      });
    } catch (err) {
      console.error('Change Admin PIN error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to update Admin PIN.',
      });
    }
  }
);

export default router;
