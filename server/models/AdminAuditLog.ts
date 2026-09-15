import mongoose, { Schema, Document } from 'mongoose';

export type AdminSecurityEventType =
  | 'ADMIN_LOGIN'
  | 'ADMIN_PIN_VERIFICATION_SUCCESS'
  | 'ADMIN_PIN_VERIFICATION_FAILURE'
  | 'ADMIN_PIN_LOCKOUT'
  | 'ADMIN_SESSION_EXPIRED'
  | 'ADMIN_LOGOUT'
  | 'ADMIN_ACCESS_DENIED'
  | 'ADMIN_PIN_CHANGED';

export interface IAdminAuditLog extends Document {
  timestamp: Date;
  adminEmail: string;
  adminUserId?: string;
  event: AdminSecurityEventType;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    adminEmail: { type: String, required: true, index: true },
    adminUserId: { type: String },
    event: {
      type: String,
      required: true,
      enum: [
        'ADMIN_LOGIN',
        'ADMIN_PIN_VERIFICATION_SUCCESS',
        'ADMIN_PIN_VERIFICATION_FAILURE',
        'ADMIN_PIN_LOCKOUT',
        'ADMIN_SESSION_EXPIRED',
        'ADMIN_LOGOUT',
        'ADMIN_ACCESS_DENIED',
        'ADMIN_PIN_CHANGED',
      ],
      index: true,
    },
    result: { type: String, required: true, enum: ['SUCCESS', 'FAILURE', 'BLOCKED'] },
    requestId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AdminAuditLogModel =
  mongoose.models.AdminAuditLog ||
  mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);

/**
 * Records an admin security audit log.
 * Strictly strips any sensitive credentials (PIN, password, tokens, cookies) before saving.
 */
export async function logAdminSecurityEvent(params: {
  adminEmail: string;
  adminUserId?: string;
  event: AdminSecurityEventType;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    const sanitizedDetails: Record<string, any> = {};
    if (params.details) {
      for (const [key, value] of Object.entries(params.details)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('pin') ||
          lowerKey.includes('pass') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('cookie') ||
          lowerKey.includes('jwt')
        ) {
          continue; // Filter out sensitive values
        }
        sanitizedDetails[key] = value;
      }
    }

    await AdminAuditLogModel.create({
      timestamp: new Date(),
      adminEmail: params.adminEmail ? params.adminEmail.toLowerCase() : 'unknown',
      adminUserId: params.adminUserId,
      event: params.event,
      result: params.result,
      requestId: params.requestId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: Object.keys(sanitizedDetails).length > 0 ? sanitizedDetails : undefined,
    });
  } catch (err) {
    console.error('Failed to write admin security audit log:', err);
  }
}
