import axios, { type AxiosError } from 'axios';
import { ordersStorage } from '../storage.js';
import { productsStorage } from '../db.js';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface WhatsAppTemplateParameter {
  type: 'text';
  text: string;
}

export interface WhatsAppTemplateComponent {
  type: 'body' | 'header' | 'button';
  sub_type?: 'url' | 'quick_reply';
  index?: string | number;
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplatePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components: WhatsAppTemplateComponent[];
  };
}

export interface WhatsAppApiResponse {
  messaging_product: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
}

export interface WhatsAppNotificationResult {
  success: boolean;
  alreadySent?: boolean;
  skipped?: boolean;
  recipient?: string;
  messageId?: string;
  error?: string;
  details?: any;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Sanitizes any parameter passed to Meta WhatsApp templates.
 * Rules:
 * - Replace newlines and tabs with ", "
 * - Collapse 4+ spaces into one
 * - Trim whitespace
 * - Fallback to "N/A" if empty
 * - Cap maximum length at 1000 characters
 */
export function sanitizeParam(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  let str = String(value);

  // Replace newlines and tabs with comma + space
  str = str.replace(/[\r\n\t]+/g, ', ');

  // Collapse 4+ spaces into a single space
  str = str.replace(/ {4,}/g, ' ');

  str = str.trim();

  if (!str) {
    return 'N/A';
  }

  // Cap length at 1000 characters (Meta's upper limit per variable)
  if (str.length > 1000) {
    str = str.substring(0, 997) + '...';
  }

  return str;
}

/**
 * Normalizes phone numbers into E.164 international format without '+' or non-digit chars.
 * - Strips spaces, dashes and "+"
 * - Removes leading 0
 * - If 10 digits, prefixes "91" (India country code)
 * - Validates length and digits only (10 to 15 digits)
 * Returns valid digits string or null if invalid.
 */
export function formatWhatsAppPhone(phone?: string | null): string | null {
  if (!phone) return null;

  // Strip spaces, dashes, +, and non-digits
  let cleaned = phone.toString().replace(/[\s\-\+]/g, '').replace(/\D/g, '');

  // Remove leading 0 (trunk prefix)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // If 10 digits and standard Indian mobile, prefix 91
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  // Must be digits only, length between 10 and 15
  if (!/^\d{10,15}$/.test(cleaned)) {
    console.warn(`[WhatsAppService] ⚠️ Invalid phone number format: '${phone}' -> normalized: '${cleaned}'`);
    return null;
  }

  return cleaned;
}

/**
 * Masks phone number for privacy-safe logging
 */
function maskPhone(phone: string): string {
  if (!phone || phone.length <= 4) return '****';
  return phone.slice(-4).padStart(phone.length, '*');
}

/**
 * Sleep helper for exponential backoff retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==========================================
// CORE SENDER WITH EXPONENTIAL BACKOFF
// ==========================================

/**
 * Generic function to send an approved Meta WhatsApp template message.
 * Supports up to 3 retries with exponential backoff on 5xx/429 or network errors.
 * Never retries on 4xx client validation errors.
 * Never logs access tokens.
 */
export async function sendTemplate(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  bodyParams: string[] = []
): Promise<WhatsAppNotificationResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  if (!phoneNumberId || !accessToken) {
    const errorMsg = 'WhatsApp credentials missing: WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN not set';
    console.warn(`[WhatsAppService] ⚠️ ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const formattedTo = formatWhatsAppPhone(to);
  if (!formattedTo) {
    const errorMsg = `Invalid recipient phone number: '${to}'`;
    console.warn(`[WhatsAppService] ⚠️ ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload: WhatsAppTemplatePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedTo,
    type: 'template',
    template: {
      name: templateName.trim(),
      language: {
        code: languageCode.trim() || 'en'
      },
      components: [
        {
          type: 'body',
          parameters: bodyParams.map((param) => ({
            type: 'text',
            text: sanitizeParam(param)
          }))
        }
      ]
    }
  };

  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[WhatsAppService] Dispatching template '${templateName}' to ${maskPhone(formattedTo)} (attempt ${attempt}/${maxRetries})...`
      );

      const response = await axios.post<WhatsAppApiResponse>(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const messageId = response.data?.messages?.[0]?.id;
      console.log(
        `[WhatsAppService] ✅ Template '${templateName}' sent to ${maskPhone(formattedTo)} successfully (Message ID: ${messageId || 'N/A'})`
      );

      return {
        success: true,
        recipient: formattedTo,
        messageId,
        details: response.data
      };
    } catch (err: any) {
      lastError = err;
      const axiosErr = err as AxiosError<any>;
      const status = axiosErr.response?.status;
      const errorData = axiosErr.response?.data?.error || axiosErr.response?.data;

      // Safe logging without leaking tokens
      console.error(
        `[WhatsAppService] ❌ Meta API error on attempt ${attempt}/${maxRetries} (HTTP ${status || 'Network Error'}):`,
        JSON.stringify(errorData || axiosErr.message)
      );

      // Do NOT retry on 4xx validation/client errors (except 429 Rate Limit)
      if (status && status >= 400 && status < 500 && status !== 429) {
        console.warn(`[WhatsAppService] Non-retryable 4xx error received. Aborting retries.`);
        const msg = errorData?.message || `Meta API HTTP ${status}`;
        return {
          success: false,
          recipient: formattedTo,
          error: msg,
          details: errorData
        };
      }

      // If we still have retries remaining, wait with exponential backoff (e.g. 1s, 2s, 4s)
      if (attempt < maxRetries) {
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        console.log(`[WhatsAppService] Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
      }
    }
  }

  const finalMsg =
    lastError?.response?.data?.error?.message ||
    lastError?.message ||
    'Failed to deliver WhatsApp message after retries';

  return {
    success: false,
    recipient: formattedTo,
    error: finalMsg,
    details: lastError?.response?.data
  };
}

// ==========================================
// TEMPLATE 1: ADMIN ORDER ALERT
// ==========================================

/**
 * Sends TEMPLATE 1: admin_order_alert (language "en")
 * Exactly 5 body variables:
 * {{1}} Order ID
 * {{2}} Order details as ONE line:
 *       "<Product name> | Size: <size> | Qty: <quantity> | <description trimmed to 80 chars>"
 *       Joined with " || " for multiple items.
 * {{3}} Payment status: "Paid INR 1499 via Razorpay (pay_XXXX)". Uses "INR".
 * {{4}} Full delivery address as ONE line: "<name>, <street>, <city>, <state>, <pincode>, <phone>"
 * {{5}} Product link: FRONTEND_URL + /products/<slug or id> (first item's link).
 */
export async function sendAdminOrderAlert(order: any): Promise<WhatsAppNotificationResult> {
  const adminPhone =
    process.env.ADMIN_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_ADMIN_NUMBER ||
    process.env.WHATSAPP_ADMIN_PHONE_NUMBER ||
    process.env.OWNER_WHATSAPP_NUMBER;

  if (!adminPhone) {
    const errorMsg = 'ADMIN_WHATSAPP_NUMBER not set in environment';
    console.warn(`[WhatsAppService] ⚠️ ${errorMsg}. Skipping admin notification.`);
    return { success: false, skipped: true, error: errorMsg };
  }

  // Idempotency check: skip if already sent
  if (order.whatsappAdminSent) {
    console.log(`[WhatsAppService] ℹ️ Admin order alert already sent for order ${order.orderNumber || order.id}. Skipping.`);
    return { success: true, alreadySent: true, recipient: adminPhone };
  }

  try {
    const templateName = process.env.WHATSAPP_ADMIN_TEMPLATE || 'admin_order_alert';
    const orderId = order.orderNumber || order.id || order._id?.toString() || 'N/A';
    const items = order.items || order.products || [];

    // Fetch catalog products to enrich descriptions and slugs if needed
    let catalogProducts: any[] = [];
    try {
      catalogProducts = await productsStorage.getProducts();
    } catch (e) {
      // Continue with order item data if catalog query fails
    }

    // 1. Build Variable {{2}}: Order Details
    const itemStrings: string[] = [];
    let firstItemProductLink = '';

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      'https://www.planetmini.in'
    ).replace(/\/$/, '');

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const dbProduct = catalogProducts.find(
        (p: any) =>
          p.id?.toString() === (item.productId || item.id || item._id)?.toString() ||
          p._id?.toString() === (item.productId || item.id || item._id)?.toString()
      );

      const name = item.name || item.productName || dbProduct?.name || 'Product';
      const size = item.size || item.selectedSize || dbProduct?.size || 'Standard';
      const qty = item.quantity || 1;
      let rawDesc = item.description || dbProduct?.description || '';
      // Trim description to 80 chars
      let descTrimmed = rawDesc ? rawDesc.replace(/[\r\n\t]+/g, ' ').trim() : '';
      if (descTrimmed.length > 80) {
        descTrimmed = descTrimmed.substring(0, 77) + '...';
      }
      if (!descTrimmed) {
        descTrimmed = 'No description';
      }

      itemStrings.push(`${name} | Size: ${size} | Qty: ${qty} | ${descTrimmed}`);

      // First item product link for variable {{5}}
      if (i === 0) {
        const slug = item.slug || dbProduct?.slug;
        const productId = item.productId || item.id || dbProduct?.id || dbProduct?._id?.toString();
        if (slug) {
          firstItemProductLink = `${frontendUrl}/products/${slug}`;
        } else if (productId) {
          firstItemProductLink = `${frontendUrl}/products/${productId}`;
        } else {
          firstItemProductLink = `${frontendUrl}/shop`;
        }
      }
    }

    const orderDetailsParam = itemStrings.length > 0 ? itemStrings.join(' || ') : 'No items';

    if (!firstItemProductLink) {
      firstItemProductLink = `${frontendUrl}/shop`;
    }

    // 2. Build Variable {{3}}: Payment status with "INR"
    const totalAmount = order.total || order.totalAmount || 0;
    const paymentId = order.paymentId || order.razorpayPaymentId || order.razorpay_payment_id || '';
    const paymentStatusParam = paymentId
      ? `Paid INR ${totalAmount} via Razorpay (${paymentId})`
      : `Paid INR ${totalAmount} via Razorpay`;

    // 3. Build Variable {{4}}: Full delivery address as ONE line
    const sa = order.shippingAddress || order.address || {};
    const addressParts = [
      sa.fullName || order.customerName || 'Valued Customer',
      sa.street || sa.addressLine1 || '',
      sa.city || '',
      sa.state || '',
      sa.pincode || sa.zipCode || '',
      sa.phone || sa.mobile || order.customerPhone || ''
    ].filter((part) => Boolean(part && String(part).trim() !== ''));

    const fullAddressParam = addressParts.length > 0 ? addressParts.join(', ') : 'Address on file';

    // 4. Variables exactly in order {{1}} to {{5}}
    const bodyParams = [
      orderId, // {{1}}
      orderDetailsParam, // {{2}}
      paymentStatusParam, // {{3}}
      fullAddressParam, // {{4}}
      firstItemProductLink // {{5}}
    ];

    return await sendTemplate(adminPhone, templateName, 'en', bodyParams);
  } catch (err: any) {
    console.error('[WhatsAppService] Error constructing admin order alert:', err);
    return { success: false, error: err?.message || 'Admin alert preparation error' };
  }
}

// ==========================================
// TEMPLATE 2: CUSTOMER ORDER CONFIRMATION
// ==========================================

/**
 * Sends TEMPLATE 2: order_confirmation_customer (language "en")
 * Body variables:
 * {{1}} Customer name (from address record)
 * {{2}} Order ID
 */
export async function sendCustomerConfirmation(order: any): Promise<WhatsAppNotificationResult> {
  const sa = order.shippingAddress || order.address || {};
  const customerPhone = sa.phone || sa.mobile || order.customerPhone;

  if (!customerPhone) {
    const errorMsg = 'No customer phone number found in order address';
    console.warn(`[WhatsAppService] ⚠️ ${errorMsg}. Skipping customer notification.`);
    return { success: false, skipped: true, error: errorMsg };
  }

  // Idempotency check: skip if already sent
  if (order.whatsappCustomerSent) {
    console.log(
      `[WhatsAppService] ℹ️ Customer order confirmation already sent for order ${order.orderNumber || order.id}. Skipping.`
    );
    return { success: true, alreadySent: true, recipient: customerPhone };
  }

  try {
    const templateName = process.env.WHATSAPP_CUSTOMER_TEMPLATE || 'order_confirmation_customer';
    const customerName = sa.fullName || order.customerName || 'Valued Customer';
    const orderId = order.orderNumber || order.id || order._id?.toString() || 'N/A';

    const bodyParams = [
      customerName, // {{1}}
      orderId // {{2}}
    ];

    return await sendTemplate(customerPhone, templateName, 'en', bodyParams);
  } catch (err: any) {
    console.error('[WhatsAppService] Error constructing customer order confirmation:', err);
    return { success: false, error: err?.message || 'Customer confirmation preparation error' };
  }
}

// ==========================================
// ASYNC COORDINATOR & IDEMPOTENT DISPATCHER
// ==========================================

/**
 * Reusable coordinator that sends both admin and customer WhatsApp notifications.
 * Can be called by Razorpay Webhook or Payment Verification controller.
 * Updates order idempotency flags in MongoDB.
 * Never throws an exception.
 */
export async function processOrderWhatsAppNotifications(
  orderOrId: any
): Promise<{
  adminResult?: WhatsAppNotificationResult;
  customerResult?: WhatsAppNotificationResult;
}> {
  let order: any = null;

  try {
    if (typeof orderOrId === 'string') {
      order = await ordersStorage.getOrderById(orderOrId);
    } else if (orderOrId && (orderOrId.id || orderOrId._id)) {
      // Re-fetch fresh state from DB to guarantee current idempotency flags
      const id = orderOrId.id || orderOrId._id?.toString();
      order = (await ordersStorage.getOrderById(id)) || orderOrId;
    } else {
      order = orderOrId;
    }

    if (!order) {
      console.warn('[WhatsAppService] Order not found for WhatsApp notification dispatch.');
      return {};
    }

    const orderId = order.id || order._id?.toString() || order.orderNumber;
    console.log(`[WhatsAppService] Processing WhatsApp notifications for Order #${order.orderNumber || orderId}...`);

    // 1. Send Admin Alert (if not already sent)
    let adminResult: WhatsAppNotificationResult = { success: false };
    if (!order.whatsappAdminSent) {
      adminResult = await sendAdminOrderAlert(order);
      if (adminResult.success && !adminResult.alreadySent) {
        await ordersStorage.updateOrderWhatsAppStatus(orderId, { adminSent: true });
      } else if (!adminResult.success && !adminResult.skipped) {
        await ordersStorage.updateOrderWhatsAppStatus(orderId, {
          error: `Admin alert failed: ${adminResult.error || 'Unknown error'}`
        });
      }
    } else {
      adminResult = { success: true, alreadySent: true };
    }

    // 2. Send Customer Confirmation (if not already sent)
    let customerResult: WhatsAppNotificationResult = { success: false };
    if (!order.whatsappCustomerSent) {
      customerResult = await sendCustomerConfirmation(order);
      if (customerResult.success && !customerResult.alreadySent) {
        await ordersStorage.updateOrderWhatsAppStatus(orderId, { customerSent: true });
      } else if (!customerResult.success && !customerResult.skipped) {
        await ordersStorage.updateOrderWhatsAppStatus(orderId, {
          error: `Customer confirmation failed: ${customerResult.error || 'Unknown error'}`
        });
      }
    } else {
      customerResult = { success: true, alreadySent: true };
    }

    return { adminResult, customerResult };
  } catch (dispatchErr: any) {
    console.error('[WhatsAppService] Unexpected error processing notifications:', dispatchErr);
    return {
      adminResult: { success: false, error: dispatchErr?.message },
      customerResult: { success: false, error: dispatchErr?.message }
    };
  }
}

// Backward-compatible alias
export const sendOrderWhatsAppNotifications = processOrderWhatsAppNotifications;
