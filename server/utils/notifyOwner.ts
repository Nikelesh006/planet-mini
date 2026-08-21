import { productsStorage } from '../db.js';

interface Order {
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
  };
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: string;
  createdAt?: Date | string;
  [key: string]: any;
}

export async function notifyOwnerOnWhatsApp(order: Order): Promise<void> {
  // Skip WhatsApp notifications on Vercel (serverless environment)
  if (process.env.VERCEL) {
    console.log('⚠️ WhatsApp notification skipped - running on Vercel (requires long-running process)');
    return;
  }

  if (!process.env.OWNER_WHATSAPP_NUMBER) {
    console.warn('OWNER_WHATSAPP_NUMBER not set in environment variables. Skipping WhatsApp notification.');
    return;
  }

  try {
    // Dynamically import whatsappClient only when not on Vercel
    const { sendWhatsAppMessage } = await import('../services/whatsappClient.js');
    
    const orderId = order.orderId || order.orderNumber || 'N/A';
    const items = order.items || [];
    
    // Fetch products to get additional details
    let dbProducts: any[] = [];
    try {
      dbProducts = await productsStorage.getProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
    }

    // Build items list with Product ID, Size, and Link
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://planet-mini-client.vercel.app';
    const itemsList = items
      .map((item, index) => {
        const name = item.name || item.productName || 'Unknown Product';
        const qty = item.quantity || 1;
        const price = item.sellingPrice || item.price || 0;
        
        // Get product details
        const dbProduct = dbProducts.find((p: any) => 
          p.id?.toString() === item.productId?.toString() || 
          p._id?.toString() === item.productId?.toString()
        );
        
        const productId = item.sku || dbProduct?.sku || item.productId || 'N/A';
        const size = item.size || dbProduct?.size || 'Not specified';
        const slug = item.slug || dbProduct?.slug || '';
        const productUrl = slug ? `${frontendUrl}/products/${slug}` : '';

        let itemText = `${index + 1}. ${name}\n`;
        itemText += `   Product ID: ${productId}\n`;
        itemText += `   Size: ${size}\n`;
        itemText += `   Quantity: ${qty}\n`;
        itemText += `   Price: ₹${price}\n`;
        if (productUrl) {
          itemText += `   🔗 ${productUrl}\n`;
        }
        
        return itemText;
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

    // Send message
    await sendWhatsAppMessage(process.env.OWNER_WHATSAPP_NUMBER, message);
    console.log(`WhatsApp notification sent for order ${orderId}`);
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
    // Don't throw - we don't want notification failures to break the application
  }
}
