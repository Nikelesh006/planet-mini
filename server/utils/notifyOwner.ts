import { sendAdminOrderNotification } from '../services/whatsappService.js';

interface Order {
  orderId?: string;
  orderNumber?: string;
  items?: Array<{
    productName?: string;
    quantity?: number;
    price?: number;
  }>;
  total?: number;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: string;
  createdAt?: Date | string;
  [key: string]: any;
}

export function notifyOwnerOnWhatsApp(order: Order): void {
  const orderId = order.orderId || order.orderNumber || order.id || order._id || 'N/A';

  void sendAdminOrderNotification(order).then((result) => {
    if (result.success) {
      console.log(`[WhatsApp] Admin notification sent for order ${orderId}`);
      return;
    }

    console.warn(
      `[WhatsApp] Admin notification skipped for order ${orderId}: ${result.error || 'unknown error'}`,
    );
  }).catch((error) => {
    console.error(`[WhatsApp] Failed to notify owner for order ${orderId}:`, error);
  });
}
