import { sendAdminOrderNotification, sendCustomerOrderNotification, sendOrderWhatsAppNotifications } from '../services/metaWhatsAppService.js';

export interface OrderNotificationPayload {
  orderId?: string;
  orderNumber?: string;
  items?: Array<{
    productName?: string;
    name?: string;
    quantity?: number;
    price?: number;
    sellingPrice?: number;
    productId?: string;
    sku?: string;
    size?: string;
    slug?: string;
    color?: string;
  }>;
  total?: number;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: string;
  createdAt?: Date | string;
  [key: string]: any;
}

/**
 * Dispatches Meta WhatsApp Cloud notification to the store Admin/Owner.
 */
export async function notifyOwnerOnWhatsApp(order: OrderNotificationPayload): Promise<void> {
  try {
    const result = await sendAdminOrderNotification(order);
    if (!result.success) {
      console.warn('[notifyOwnerOnWhatsApp] Admin notification issue:', result.error);
    }
  } catch (error) {
    console.error('[notifyOwnerOnWhatsApp] Failed to send WhatsApp notification:', error);
  }
}

/**
 * Dispatches Meta WhatsApp Cloud notification to the Customer.
 */
export async function notifyCustomerOnWhatsApp(order: OrderNotificationPayload): Promise<void> {
  try {
    const result = await sendCustomerOrderNotification(order);
    if (!result.success) {
      console.warn('[notifyCustomerOnWhatsApp] Customer notification issue:', result.error);
    }
  } catch (error) {
    console.error('[notifyCustomerOnWhatsApp] Failed to send customer WhatsApp notification:', error);
  }
}

/**
 * Dispatches Meta WhatsApp Cloud notifications to BOTH Admin and Customer.
 */
export async function notifyOrderWhatsApp(order: OrderNotificationPayload): Promise<void> {
  try {
    await sendOrderWhatsAppNotifications(order);
  } catch (error) {
    console.error('[notifyOrderWhatsApp] Failed to send order WhatsApp notifications:', error);
  }
}
