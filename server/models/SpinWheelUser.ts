import mongoose, { Schema, Document } from 'mongoose';

export interface ISpinWheelUser extends Document {
  phone: string;
  email: string;
  hasSpun: boolean;
  totalSpins: number;
  lastSpinAt?: Date;
  termsAccepted: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SpinWheelUserSchema = new Schema<ISpinWheelUser>(
  {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    hasSpun: {
      type: Boolean,
      default: false
    },
    totalSpins: {
      type: Number,
      default: 0
    },
    lastSpinAt: {
      type: Date,
      default: null
    },
    termsAccepted: {
      type: Boolean,
      required: true
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
SpinWheelUserSchema.index({ phone: 1, email: 1 });
SpinWheelUserSchema.index({ hasSpun: 1 });

export default mongoose.models.SpinWheelUser || mongoose.model<ISpinWheelUser>('SpinWheelUser', SpinWheelUserSchema);
