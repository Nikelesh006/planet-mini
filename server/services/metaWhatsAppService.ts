import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import { productsStorage } from '../db.js';
import { ordersStorage } from '../storage.js';

export interface MetaWhatsAppNotificationResult {
  success: boolean;
  alreadySent?: boolean;
  recipient?: string;
  error?: string;
  response?: any;
}

/**
 * Normalizes any phone number into international format without '+' or spaces.
 * Example: '9597755722' -> '919597755722'
 * Example: '+91 95977 55722' -> '919597755722'
 * Example: '09597755722' -> '919597755722'
 */
export function normalizeWhatsAppPhone(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // Strip leading 0 if 11 digits
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }
  
  // If 10 digits and standard Indian mobile (starts with 6, 7, 8, 9), prefix 91
  if (cleaned.length === 10 && /^[6789]/.test(cleaned)) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
}

/**
 * Low-level sender that posts to Meta WhatsApp Cloud API endpoint.
 * Supports Meta Templates with direct text fallback.
 */
export async function sendMetaCloudMessage(params: {
  toPhone: string;
  textBody: string;
  templateName?: string;
  templateParameters?: Array<{ type: string; text?: string; [key: string]: any }>;
}): Promise<MetaWhatsAppNotificationResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (!accessToken || !phoneNumberId) {
    const errorMsg = 'WhatsApp Cloud API credentials missing (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID)';
    console.warn(`[MetaWhatsApp] ⚠️ ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const normalizedTo = normalizeWhatsAppPhone(params.toPhone);
  if (!normalizedTo || normalizedTo.length < 10) {
    const errorMsg = `Invalid recipient phone number: '${params.toPhone}' (normalized: '${normalizedTo}')`;
    console.warn(`[MetaWhatsApp] ⚠️ ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Helper to make API post call
  const postToMeta = async (payload: any) => {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  };

  // Try sending as Meta Template if a template name is configured
  if (params.templateName && params.templateName.trim() !== '') {
    try {
      const templatePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedTo,
        type: 'template',
        template: {
          name: params.templateName.trim(),
          language: {
            code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en'
          },
          components: [
            {
              type: 'body',
              parameters: params.templateParameters || [
                {
                  type: 'text',
                  text: params.textBody
                }
              ]
            }
          ]
        }
      };

      console.log(`[MetaWhatsApp] Sending template '${params.templateName}' to ${normalizedTo}...`);
      const res = await postToMeta(templatePayload);
      const resJson = await res.json() as any;

      if (res.ok) {
        console.log(`[MetaWhatsApp] ✅ Template '${params.templateName}' delivered to ${normalizedTo}`);
        return { success: true, recipient: normalizedTo, response: resJson };
      }

      console.warn(`[MetaWhatsApp] ⚠️ Template send failed (HTTP ${res.status}):`, resJson?.error?.message || resJson);
      // If template failed, fall through to attempt direct text delivery
    } catch (tmplErr: any) {
      console.warn('[MetaWhatsApp] ⚠️ Template dispatch exception:', tmplErr.message);
    }
  }

  // Fallback or Direct Text Message delivery
  try {
    const textPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizedTo,
      type: 'text',
      text: {
        preview_url: true,
        body: params.textBody
      }
    };

    console.log(`[MetaWhatsApp] Sending text message to ${normalizedTo}...`);
    const res = await postToMeta(textPayload);
    const resJson = await res.json() as any;

    if (!res.ok) {
      const errorMsg = resJson?.error?.message || `Meta API HTTP ${res.status}`;
      console.error(`[MetaWhatsApp] ❌ Failed to send WhatsApp message to ${normalizedTo}:`, resJson?.error || resJson);
      return { success: false, recipient: normalizedTo, error: errorMsg, response: resJson };
    }

    console.log(`[MetaWhatsApp] ✅ WhatsApp message sent successfully to ${normalizedTo}`);
    return { success: true, recipient: normalizedTo, response: resJson };
  } catch (err: any) {
    const errorMsg = err.message || 'Network error contacting Meta API';
    console.error(`[MetaWhatsApp] ❌ Network exception sending message to ${normalizedTo}:`, err);
    return { success: false, recipient: normalizedTo, error: errorMsg };
  }
}

/**
 * Builds and dispatches the Admin WhatsApp notification for a new paid order.
 * Strictly includes:
 * - Product Name
 * - Product Link
 * - Size (of each product)
 * - Quantity (of each product)
 * - Price of each product
 * - Total price
 * - Customer Details & Complete Delivery Address
 */
export async function sendAdminOrderNotification(order: any): Promise<MetaWhatsAppNotificationResult> {
  try {
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE_NUMBER || process.env.OWNER_WHATSAPP_NUMBER;
    if (!adminPhone) {
      console.warn('[MetaWhatsApp] WHATSAPP_ADMIN_PHONE_NUMBER not configured. Skipping admin notification.');
      return { success: false, error: 'WHATSAPP_ADMIN_PHONE_NUMBER not set' };
    }

    // 1. Fetch user profile if available
    let customerName = 'Valued Customer';
    let customerPhone = 'N/A';
    let customerEmail = 'N/A';

    if (order.userId) {
      try {
        const profile = await Profile.findOne({ userId: order.userId });
        if (profile) {
          customerName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || customerName;
          customerPhone = profile.phone || customerPhone;
          customerEmail = profile.email || customerEmail;
        }
      } catch (err) {
        console.error('[MetaWhatsApp] Could not fetch profile for order:', err);
      }
    }

    // Fallback customer info from shipping address
    const sa = order.shippingAddress || {};
    if (sa.fullName) customerName = sa.fullName;
    if (sa.phone) customerPhone = sa.phone;
    if (order.customerEmail) customerEmail = order.customerEmail;

    // 2. Fetch catalog products to build accurate product links and size data
    let catalogProducts: any[] = [];
    try {
      catalogProducts = await productsStorage.getProducts();
    } catch (err) {
      console.error('[MetaWhatsApp] Could not fetch catalog products for links:', err);
    }

    const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://planet-mini-client.vercel.app').replace(/\/$/, '');
    const items = order.items || order.products || [];

    let itemsBreakdown = '';
    let itemIndex = 1;

    for (const item of items) {
      const dbProduct = catalogProducts.find((p: any) =>
        p.id?.toString() === item.productId?.toString() ||
        p._id?.toString() === item.productId?.toString()
      );

      const name = item.name || item.productName || dbProduct?.name || 'Product';
      const size = item.size || dbProduct?.size || item.selectedSize || 'Standard';
      const qty = item.quantity || 1;
      const price = item.sellingPrice || item.price || dbProduct?.sellingPrice || 0;
      const itemSubtotal = qty * price;
      const slug = item.slug || dbProduct?.slug || '';
      const productLink = slug ? `${frontendUrl}/products/${slug}` : `${frontendUrl}/shop`;

      itemsBreakdown += `${itemIndex}. *${name}*\n`;
      itemsBreakdown += `   🔗 Link: ${productLink}\n`;
      itemsBreakdown += `   📏 Size: ${size}\n`;
      itemsBreakdown += `   🔢 Quantity: ${qty}\n`;
      itemsBreakdown += `   💵 Price: ₹${price}\n`;
      itemsBreakdown += `   🏷️ Subtotal: ₹${itemSubtotal}\n\n`;
      itemIndex++;
    }

    if (!itemsBreakdown) {
      itemsBreakdown = 'No items found.\n\n';
    }

    // 3. Format Address
    const addressLines = [
      sa.fullName || customerName,
      sa.street || sa.addressLine1,
      sa.landmark ? `Landmark: ${sa.landmark}` : null,
      `${sa.city || ''}, ${sa.state || ''} - ${sa.pincode || sa.zipCode || ''}`.trim(),
      `Phone: ${sa.phone || customerPhone}`
    ].filter(Boolean).join('\n');

    const orderId = order.orderNumber || order.id || order._id || 'N/A';
    const totalAmount = order.total || order.totalAmount || 0;
    const paymentId = order.paymentId || 'Prepaid';
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const adminMessageText = `🛒 *NEW ORDER RECEIVED!* 🚀
━━━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* #${orderId}
💳 *Payment Status:* ✅ PAID (${paymentId})
📅 *Date & Time:* ${dateStr}

👤 *CUSTOMER DETAILS*
• Name: ${customerName}
• Phone: ${customerPhone}
• Email: ${customerEmail}

📦 *ORDERED PRODUCTS*
${itemsBreakdown}💰 *TOTAL PRICE*
• Items Total: ₹${items.reduce((sum: number, it: any) => sum + ((it.quantity || 1) * (it.sellingPrice || it.price || 0)), 0)}
• Discount: ₹${order.discount || 0}
• Shipping: ₹${order.shipping || order.shippingCharge || 0}
• *TOTAL AMOUNT PAID: ₹${totalAmount}*

🚚 *DELIVERY ADDRESS*
${addressLines}

━━━━━━━━━━━━━━━━━━━━━
Please process and dispatch this order.`;

    const templateName = process.env.WHATSAPP_ADMIN_TEMPLATE_NAME;

    return await sendMetaCloudMessage({
      toPhone: adminPhone,
      textBody: adminMessageText,
      templateName
    });

  } catch (err: any) {
    console.error('[MetaWhatsApp] Error sending admin order notification:', err);
    return { success: false, error: err.message || 'Unknown admin notification error' };
  }
}

/**
 * Builds and dispatches the Customer WhatsApp notification for order placed and payment completed.
 * Sent to the mobile number mentioned in the shipping address.
 * Strictly includes:
 * - "Order placed successfully" confirmation
 * - Order ID
 * - "Payment successful" status
 * - Product list with size, quantity, price
 * - Total price
 * - Delivery address
 */
export async function sendCustomerOrderNotification(order: any): Promise<MetaWhatsAppNotificationResult> {
  try {
    const sa = order.shippingAddress || {};
    const customerPhone = sa.phone || sa.mobile || order.customerPhone;

    if (!customerPhone) {
      console.warn('[MetaWhatsApp] No customer phone number in order shipping address. Skipping customer notification.');
      return { success: false, error: 'No customer phone number in shipping address' };
    }

    const orderId = order.orderNumber || order.id || order._id || 'N/A';
    const customerName = sa.fullName || order.customerName || 'Valued Customer';
    const totalAmount = order.total || order.totalAmount || 0;
    const paymentId = order.paymentId || 'Prepaid';
    const items = order.items || order.products || [];

    let itemsBreakdown = '';
    let itemIndex = 1;
    for (const item of items) {
      const name = item.name || item.productName || 'Product';
      const size = item.size || item.selectedSize || 'Standard';
      const qty = item.quantity || 1;
      const price = item.sellingPrice || item.price || 0;

      itemsBreakdown += `${itemIndex}. *${name}*\n`;
      itemsBreakdown += `   • Size: ${size}\n`;
      itemsBreakdown += `   • Quantity: ${qty}\n`;
      itemsBreakdown += `   • Price: ₹${price}\n`;
      itemIndex++;
    }

    const addressLines = [
      sa.fullName || customerName,
      sa.street || sa.addressLine1,
      sa.landmark ? `Landmark: ${sa.landmark}` : null,
      `${sa.city || ''}, ${sa.state || ''} - ${sa.pincode || sa.zipCode || ''}`.trim()
    ].filter(Boolean).join('\n');

    const customerMessageText = `🎉 *ORDER PLACED SUCCESSFULLY!*

Hi ${customerName}, thank you for shopping with *Planet Mini*! 🛍️
Your order has been confirmed and payment has been received successfully.

📋 *Order Details:*
• Order ID: *#${orderId}*
• Payment Status: *✅ Payment Successful*
• Payment Reference: ${paymentId}

📦 *Items Ordered:*
${itemsBreakdown || 'No items listed\n'}
💰 *Total Amount Paid:* *₹${totalAmount}*

🚚 *Delivering to:*
${addressLines}

We will notify you once your order is packed and dispatched. If you need any assistance, reply directly to this message or contact Planet Mini support! ❤️

✨ *Team Planet Mini*`;

    const templateName = process.env.WHATSAPP_CUSTOMER_TEMPLATE_NAME;

    return await sendMetaCloudMessage({
      toPhone: customerPhone,
      textBody: customerMessageText,
      templateName
    });

  } catch (err: any) {
    console.error('[MetaWhatsApp] Error sending customer order notification:', err);
    return { success: false, error: err.message || 'Unknown customer notification error' };
  }
}

/**
 * Main coordinator function triggered when an order is placed and payment is completed.
 * Dispatches WhatsApp notifications to both Admin and Customer in parallel.
 * Updates order storage with delivery logs.
 */
export async function sendOrderWhatsAppNotifications(order: any): Promise<{
  adminResult: MetaWhatsAppNotificationResult;
  customerResult: MetaWhatsAppNotificationResult;
}> {
  console.log(`[MetaWhatsApp] 🔔 Triggering WhatsApp order notifications for Order #${order.orderNumber || order.id}...`);

  const orderId = order.id || order._id?.toString() || order.orderNumber;

  const [adminResult, customerResult] = await Promise.all([
    sendAdminOrderNotification(order).catch(err => ({
      success: false,
      error: err.message || 'Admin notification failed'
    })),
    sendCustomerOrderNotification(order).catch(err => ({
      success: false,
      error: err.message || 'Customer notification failed'
    }))
  ]);

  // Update order database tracking records
  if (orderId) {
    try {
      if (typeof ordersStorage.updateOrderWhatsAppNotificationStatus === 'function') {
        await ordersStorage.updateOrderWhatsAppNotificationStatus(
          orderId,
          'admin',
          adminResult.success,
          adminResult.error || null
        );
        await ordersStorage.updateOrderWhatsAppNotificationStatus(
          orderId,
          'customer',
          customerResult.success,
          customerResult.error || null
        );
      } else if (typeof ordersStorage.updateOrderWhatsAppStatus === 'function') {
        await ordersStorage.updateOrderWhatsAppStatus(
          orderId,
          adminResult.success,
          adminResult.error || null
        );
      }
    } catch (dbErr) {
      console.error('[MetaWhatsApp] Failed to record WhatsApp status in database:', dbErr);
    }
  }

  return { adminResult, customerResult };
}
