import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppCredential extends Document {
  /** WhatsApp Business Account ID from the Embedded Signup session event */
  wabaId: string;
  /** Phone Number ID from the Embedded Signup session event */
  phoneNumberId: string;
  /** Business token obtained by exchanging the auth code */
  accessTokenEncrypted: string;
  /** Token type (usually 'bearer') */
  tokenType: string;
  /** Seconds until expiry (0 = permanent) */
  expiresIn: number;
  /** When this credential was created */
  createdAt: Date;
  /** When this credential was last updated */
  updatedAt: Date;
}

const WhatsAppCredentialSchema = new Schema<IWhatsAppCredential>(
  {
    wabaId: { type: String, required: true, index: true },
    phoneNumberId: { type: String, required: true, index: true },
    accessTokenEncrypted: { type: String, required: true },
    tokenType: { type: String, default: 'bearer' },
    expiresIn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.WhatsAppCredential ||
  mongoose.model<IWhatsAppCredential>('WhatsAppCredential', WhatsAppCredentialSchema);
