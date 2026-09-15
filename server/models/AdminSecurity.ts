import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminSecurity extends Document {
  key: string;
  adminPinHash: string;
  failedAttempts: number;
  lockoutUntil: Date | null;
  lastChangedAt: Date;
  updatedBy: string;
}

const AdminSecuritySchema = new Schema<IAdminSecurity>(
  {
    key: { type: String, required: true, unique: true, default: 'global_admin_security' },
    adminPinHash: { type: String, required: true },
    failedAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
    lastChangedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

export const AdminSecurityModel =
  mongoose.models.AdminSecurity ||
  mongoose.model<IAdminSecurity>('AdminSecurity', AdminSecuritySchema);

// Configurable constants via environment variables
export const ADMIN_PIN_MAX_ATTEMPTS = parseInt(process.env.ADMIN_PIN_MAX_ATTEMPTS || '5', 10);
export const ADMIN_PIN_LOCKOUT_MINUTES = parseInt(process.env.ADMIN_PIN_LOCKOUT_MINUTES || '15', 10);
export const ADMIN_PIN_SESSION_MINUTES = parseInt(process.env.ADMIN_PIN_SESSION_MINUTES || '15', 10);

/**
 * Loads the Admin password / PIN strictly from environment variables (.env).
 * Supports ADMIN_PASSWORD or ADMIN_INITIAL_PIN.
 * No hardcoded PIN or fallback password exists in the codebase.
 */
function getEnvAdminPin(): string {
  const pin = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PIN;
  return pin ? pin.trim() : '';
}

/**
 * Retrieves the global admin security document or seeds it on first run.
 */
export async function getOrCreateAdminSecurity(): Promise<IAdminSecurity> {
  let record = await AdminSecurityModel.findOne({ key: 'global_admin_security' });
  const envPin = getEnvAdminPin();

  if (!record) {
    if (!envPin) {
      throw new Error(
        'SECURITY ERROR: ADMIN_PASSWORD or ADMIN_INITIAL_PIN is not configured in .env file.'
      );
    }
    const saltRounds = 10;
    const initialHash = await bcrypt.hash(envPin, saltRounds);
    record = await AdminSecurityModel.create({
      key: 'global_admin_security',
      adminPinHash: initialHash,
      failedAttempts: 0,
      lockoutUntil: null,
      lastChangedAt: new Date(),
      updatedBy: 'system_initialization',
    });
    console.log('🔒 Admin Security: Initialized Admin PIN hash in database from .env');
  }
  return record;
}

/**
 * Verifies a submitted 6-digit PIN against the stored hash with rate-limiting and lockout protection.
 */
export async function verifyAdminPinRecord(submittedPin: string): Promise<{
  success: boolean;
  lockedOut?: boolean;
  remainingMinutes?: number;
  remainingAttempts?: number;
  error?: string;
}> {
  const security = await getOrCreateAdminSecurity();

  // 1. Check if currently locked out
  if (security.lockoutUntil && security.lockoutUntil > new Date()) {
    const remainingMs = security.lockoutUntil.getTime() - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return {
      success: false,
      lockedOut: true,
      remainingMinutes,
      error: `Too many failed attempts. Admin PIN verification locked out for ${remainingMinutes} more minute(s).`,
    };
  }

  // 2. Validate format: strictly 6 numeric digits
  if (!/^\d{6}$/.test(submittedPin)) {
    return {
      success: false,
      error: 'Invalid PIN format. PIN must be exactly 6 digits.',
    };
  }

  // 3. Compare with bcrypt hash OR direct .env match
  const envPin = getEnvAdminPin();
  let isMatch = false;

  if (envPin && submittedPin === envPin) {
    isMatch = true;
    // Keep database hash synchronized with .env password if it changed
    const hashMatches = await bcrypt.compare(submittedPin, security.adminPinHash).catch(() => false);
    if (!hashMatches) {
      const saltRounds = 10;
      security.adminPinHash = await bcrypt.hash(envPin, saltRounds);
      security.lastChangedAt = new Date();
      security.updatedBy = 'env_sync';
      await security.save();
      console.log('🔒 Admin Security: Synchronized database hash with updated ADMIN_PASSWORD from .env');
    }
  } else {
    isMatch = await bcrypt.compare(submittedPin, security.adminPinHash);
  }

  if (isMatch) {
    // Reset failed attempts on success
    if (security.failedAttempts > 0 || security.lockoutUntil !== null) {
      security.failedAttempts = 0;
      security.lockoutUntil = null;
      await security.save();
    }
    return { success: true };
  }

  // 4. Handle failed attempt
  const updatedAttempts = (security.failedAttempts || 0) + 1;
  security.failedAttempts = updatedAttempts;

  if (updatedAttempts >= ADMIN_PIN_MAX_ATTEMPTS) {
    const lockoutUntil = new Date(Date.now() + ADMIN_PIN_LOCKOUT_MINUTES * 60 * 1000);
    security.lockoutUntil = lockoutUntil;
    await security.save();
    return {
      success: false,
      lockedOut: true,
      remainingMinutes: ADMIN_PIN_LOCKOUT_MINUTES,
      error: `Maximum attempts exceeded. Admin PIN verification locked out for ${ADMIN_PIN_LOCKOUT_MINUTES} minutes.`,
    };
  }

  await security.save();
  const remainingAttempts = ADMIN_PIN_MAX_ATTEMPTS - updatedAttempts;

  return {
    success: false,
    remainingAttempts,
    error: `Incorrect Admin PIN. ${remainingAttempts} attempt(s) remaining before lockout.`,
  };
}

/**
 * Updates the 6-digit Admin PIN hash in the database.
 */
export async function updateAdminPinRecord(
  newPin: string,
  updatedByEmail: string
): Promise<{ success: boolean; error?: string }> {
  if (!/^\d{6}$/.test(newPin)) {
    return { success: false, error: 'New PIN must be exactly 6 digits.' };
  }

  const security = await getOrCreateAdminSecurity();
  const isSamePin = await bcrypt.compare(newPin, security.adminPinHash);
  if (isSamePin) {
    return { success: false, error: 'New PIN cannot be the same as the current PIN.' };
  }

  const saltRounds = 10;
  security.adminPinHash = await bcrypt.hash(newPin, saltRounds);
  security.failedAttempts = 0;
  security.lockoutUntil = null;
  security.lastChangedAt = new Date();
  security.updatedBy = updatedByEmail || 'admin';
  await security.save();

  return { success: true };
}
