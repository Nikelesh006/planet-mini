import mongoose, { Schema, Document } from 'mongoose';

export type CartAlertStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'cancelled_order_placed'
  | 'cancelled_cart_cleared'
  | 'failed';

export interface ICartAlert extends Document {
  userId: string;
  phone: string;
  customerName: string;
  cartItems: any[];
  cartCount: number;
  cartTotal: number;
  scheduledFor: Date;
  status: CartAlertStatus;
  whatsappMessageId?: string;
  whatsappError?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartAlertSchema = new Schema<ICartAlert>(
  {
    userId: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    customerName: { type: String, default: 'Customer' },
    cartItems: { type: Schema.Types.Mixed, default: [] },
    cartCount: { type: Number, default: 0 },
    cartTotal: { type: Number, default: 0 },
    scheduledFor: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'sent',
        'cancelled_order_placed',
        'cancelled_cart_cleared',
        'failed'
      ],
      default: 'pending',
      index: true
    },
    whatsappMessageId: { type: String },
    whatsappError: { type: String },
    sentAt: { type: Date }
  },
  { timestamps: true }
);

CartAlertSchema.index({ status: 1, scheduledFor: 1 });
CartAlertSchema.index({ userId: 1, status: 1 });

export const CartAlertModel =
  mongoose.models.CartAlert || mongoose.model<ICartAlert>('CartAlert', CartAlertSchema);

export default CartAlertModel;
