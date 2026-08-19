import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import { productsStorage } from '../db.js';

export interface WhatsAppNotificationResult {
  success: boolean;
  alreadySent?: boolean;
  error?: string;
  response?: any;
}

/**
 * Sends a WhatsApp notification to the admin with complete order details.
 * Implements duplicate notification protection and safe error handling.
 */
export async function sendAdminOrderNotification(order: any): Promise<WhatsAppNotificationResult> {
  try {
    // 1. Duplicate protection check
    if (order.whatsappAdminNotificationSent) {
      console.log(`[WhatsAppService] Notification already sent for order: ${order.orderNumber}`);
      return { success: true, alreadySent: true };
    }

    // 2. Load and validate WhatsApp configuration from environment variables
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE_NUMBER;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'new_order_admin_notification';

    if (!accessToken || !phoneNumberId || !adminPhone) {
      const errorMsg = 'Missing WhatsApp Cloud API credentials in environment variables';
      console.error(`[WhatsAppService] ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    // Clean up admin phone number (remove +, spaces, hyphens if any)
    const cleanedAdminPhone = adminPhone.replace(/[+\s-]/g, '');

    console.log(`[WhatsAppService] Formatting order message for: ${order.orderNumber || order.id || order._id}`);

    // 3. Fetch user details from profile
    let customerEmail = 'N/A';
    let customerName = 'N/A';
    let customerPhone = 'N/A';

    try {
      if (order.userId) {
        const profile = await Profile.findOne({ userId: order.userId });
        if (profile) {
          customerEmail = profile.email || 'N/A';
          customerName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'N/A';
          customerPhone = profile.phone || 'N/A';
        }
      }
    } catch (dbErr) {
      console.error('[WhatsAppService] Error querying customer Profile:', dbErr);
    }

    // Fallbacks to shipping address properties
    const sa = order.shippingAddress || {};
    if (customerName === 'N/A' && sa.fullName) customerName = sa.fullName;
    if (customerPhone === 'N/A' && sa.phone) customerPhone = sa.phone;

    // 4. Fetch all DB products to match SKUs if not present on order items
    let dbProducts: any[] = [];
    try {
      dbProducts = await productsStorage.getProducts();
    } catch (productErr) {
      console.error('[WhatsAppService] Error fetching products for SKUs:', productErr);
    }

    // 5. Format Product List
    let productListText = '';
    let index = 1;
    const items = order.items || order.products || [];
    
    for (const item of items) {
      const dbProduct = dbProducts.find((p: any) => 
        p.id?.toString() === item.productId?.toString() || 
        p._id?.toString() === item.productId?.toString()
      );
      const sku = item.sku || dbProduct?.sku || 'N/A';
      const name = item.name || item.productName || 'Unknown Product';
      const qty = item.quantity || 1;
      const price = item.sellingPrice || item.price || 0;
      const itemTotal = qty * price;

      productListText += `${index}. ${name}\n`;
      if (sku !== 'N/A') productListText += `   SKU: ${sku}\n`;
      productListText += `   Qty: ${qty}\n`;
      productListText += `   Price: ₹${price}\n`;
      productListText += `   Total: ₹${itemTotal}\n\n`;
      index++;
    }

    if (productListText === '') {
      productListText = 'No products found in order.\n\n';
    }

    // 6. Format Address Details
    const addressComponents = [
      sa.fullName || sa.name || customerName,
      sa.phone || customerPhone,
      sa.street || sa.addressLine1 || 'N/A',
      sa.city || 'N/A',
      sa.state || 'N/A',
      sa.pincode || sa.zipCode || 'N/A'
    ];
    if (sa.landmark) {
      addressComponents.push(`Landmark: ${sa.landmark}`);
    }
    const formattedAddress = addressComponents.filter(Boolean).join('\n');

    // 7. Format Payment Summary
    const itemTotalSum = items.reduce((acc: number, item: any) => acc + ((item.quantity || 1) * (item.sellingPrice || item.price || 0)), 0);
    const discount = order.discount || 0;
    const shipping = order.shipping || order.shippingCharge || 0;
    const totalPaid = order.total || order.totalAmount || 0;

    // 8. Build the exact formatted text body
    // This text block will be passed inside the single parameter {{1}} of the template
    const formattedOrderText = `Order ID: #${order.orderNumber || order.id || 'N/A'}
Payment: ✅ PAID

👤 *CUSTOMER*
Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}

📦 *PRODUCTS*

${productListText}💰 *PAYMENT*
Subtotal: ₹${itemTotalSum}
Discount: ₹${discount}
Shipping: ₹${shipping}
Total Paid: ₹${totalPaid}

🚚 *DELIVERY ADDRESS*
${formattedAddress}

Razorpay Payment ID:
${order.paymentId || 'N/A'}

Please process this order.`;

    // 9. Prepare request payload for Meta WhatsApp Business Cloud API
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanedAdminPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: formattedOrderText
              }
            ]
          }
        ]
      }
    };

    console.log(`[WhatsAppService] Sending API request to: ${url}`);
    
    // 10. Perform HTTP call to Meta API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseJson = await response.json() as any;

    if (!response.ok) {
      const apiError = responseJson.error?.message || 'Meta API returned an error';
      console.error('[WhatsAppService] Meta API error details:', responseJson.error);
      return {
        success: false,
        error: `Meta API HTTP ${response.status}: ${apiError}`,
        response: responseJson
      };
    }

    console.log(`[WhatsAppService] WhatsApp notification sent successfully for order ${order.orderNumber}`);
    return {
      success: true,
      response: responseJson
    };

  } catch (error: any) {
    const errorMsg = error.message || 'Unknown network error';
    console.error('[WhatsAppService] Failed to send WhatsApp notification:', error);
    return {
      success: false,
      error: errorMsg
    };
  }
}
