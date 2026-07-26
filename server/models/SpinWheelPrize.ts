import mongoose, { Schema, Document } from 'mongoose';

export interface ISpinWheelPrize extends Document {
  label: string;
  color: string;
  discountPercentage?: number;
  discountType?: 'percentage' | 'fixed' | 'none';
  discountValue?: number;
  isSpinAgain: boolean;
  isNoLuck: boolean;
  isActive: boolean;
  position: number; // Position on the wheel (0-7 for 8 segments)
  createdAt: Date;
  updatedAt: Date;
}

const SpinWheelPrizeSchema = new Schema<ISpinWheelPrize>(
  {
    label: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      required: true
    },
    discountPercentage: {
      type: Number,
      default: null
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'none'],
      default: 'none'
    },
    discountValue: {
      type: Number,
      default: null
    },
    isSpinAgain: {
      type: Boolean,
      default: false
    },
    isNoLuck: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    position: {
      type: Number,
      required: true,
      min: 0,
      max: 7 // Assuming 8 segments on the wheel
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
SpinWheelPrizeSchema.index({ position: 1, isActive: 1 });

export default mongoose.models.SpinWheelPrize || mongoose.model<ISpinWheelPrize>('SpinWheelPrize', SpinWheelPrizeSchema);
