import { sendWhatsAppMessage } from '../services/whatsappClient';

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
}

export function notifyOwnerOnWhatsApp(order: Order): void {
  console.log('>>> notifyOwnerOnWhatsApp called with order:', JSON.stringify(order, null, 2));
  
  if (!process.env.OWNER_WHATSAPP_NUMBER) {
    console.warn('OWNER_WHATSAPP_NUMBER not set in environment variables. Skipping WhatsApp notification.');
    return;
  }

  console.log('OWNER_WHATSAPP_NUMBER:', process.env.OWNER_WHATSAPP_NUMBER);

  try {
    const orderId = order.orderId || order.orderNumber || 'N/A';
    const items = order.items || [];
    
    console.log('Order items:', items);
    
    // Build items list
    const itemsList = items
      .map((item, index) => {
        const name = item.productName || 'Unknown Product';
        const qty = item.quantity || 1;
        const price = item.price || 0;
        return `${index + 1}. ${name} x${qty} - ₹${price}`;
      })
      .join('\n');

    // Build shipping address
    const address = order.shippingAddress || {};
    const shippingAddress = [
      address.fullName,
      address.street,
      `${address.city}, ${address.state}`,
      address.pincode
    ].filter(Boolean).join('\n');

    // Build message
    const message = `🛒 *NEW ORDER RECEIVED*

📋 *Order ID:* ${orderId}
💰 *Total Amount:* ₹${order.total || 0}
💳 *Payment Status:* ${order.paymentStatus || 'N/A'}
📅 *Order Date:* ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}

📦 *Items:*
${itemsList || 'No items'}

📍 *Shipping Address:*
${shippingAddress || 'No address provided'}

👤 *Customer Details:*
Name: ${order.customerName || address.fullName || 'N/A'}
Phone: ${order.customerPhone || address.phone || 'N/A'}

---
*Powered by Planet Mini*`;

    console.log('Message prepared, sending WhatsApp message...');
    console.log('Message content:', message);

    // Send message
    sendWhatsAppMessage(process.env.OWNER_WHATSAPP_NUMBER, message);
    console.log(`WhatsApp notification sent for order ${orderId}`);
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
    // Don't throw - we don't want notification failures to break the application
  }
}
