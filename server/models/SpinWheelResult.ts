import mongoose, { Schema, Document } from 'mongoose';

export interface ISpinWheelResult extends Document {
  userId: mongoose.Types.ObjectId;
  prizeId: mongoose.Types.ObjectId;
  prizeLabel: string;
  prizeColor: string;
  discountPercentage?: number;
  discountType?: 'percentage' | 'fixed' | 'none';
  discountValue?: number;
  isSpinAgain: boolean;
  isNoLuck: boolean;
  wheelPosition: number; // The position on the wheel (0-7)
  rotationAngle: number; // The rotation angle when the wheel stopped
  spinDuration: number; // Duration of the spin in milliseconds
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SpinWheelResultSchema = new Schema<ISpinWheelResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'SpinWheelUser',
      required: true
    },
    prizeId: {
      type: Schema.Types.ObjectId,
      ref: 'SpinWheelPrize',
      required: true
    },
    prizeLabel: {
      type: String,
      required: true
    },
    prizeColor: {
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
    wheelPosition: {
      type: Number,
      required: true,
      min: 0,
      max: 7
    },
    rotationAngle: {
      type: Number,
      required: true
    },
    spinDuration: {
      type: Number,
      required: true
    },
    claimed: {
      type: Boolean,
      default: false
    },
    claimedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
SpinWheelResultSchema.index({ userId: 1, createdAt: -1 });
SpinWheelResultSchema.index({ claimed: 1 });

export default mongoose.models.SpinWheelResult || mongoose.model<ISpinWheelResult>('SpinWheelResult', SpinWheelResultSchema);
