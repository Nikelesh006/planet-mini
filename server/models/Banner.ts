import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  imageUrl: string;
  alt: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: 'Banner',
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
BannerSchema.index({ active: 1, order: 1 });

export default mongoose.model<IBanner>('Banner', BannerSchema);
