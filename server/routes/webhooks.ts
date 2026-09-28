import express, { type Request, type Response } from 'express';
import crypto from 'crypto';
import { ordersStorage } from '../storage.js';
import { processOrderWhatsAppNotifications } from '../services/whatsapp.service.js';

const router = express.Router();

// ==========================================
// TYPES & INTERFACES FOR RAZORPAY WEBHOOK
// ==========================================

export interface RazorpayPaymentEntity {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: string;
  order_id?: string;
  invoice_id?: string | null;
  international?: boolean;
  method?: string;
  amount_refunded?: number;
  refund_status?: string | null;
  captured?: boolean;
  description?: string;
  card_id?: string | null;
  bank?: string | null;
  wallet?: string | null;
  vpa?: string | null;
  email?: string;
  contact?: string;
  notes?: Record<string, any>;
  fee?: number;
  tax?: number;
  error_code?: string | null;
  error_description?: string | null;
  created_at?: number;
}

export interface RazorpayOrderEntity {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  offer_id?: string | null;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes?: Record<string, any>;
  created_at?: number;
}

export interface RazorpayWebhookPayload {
  entity: 'event';
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: RazorpayPaymentEntity;
    };
    order?: {
      entity: RazorpayOrderEntity;
    };
  };
  created_at: number;
}

// ==========================================
// WEBHOOK ENDPOINT: POST /api/webhooks/razorpay
// ==========================================

/**
 * Handles incoming Razorpay webhooks.
 * Uses express.raw() for this route to preserve the exact raw body for HMAC SHA256 signature verification.
 */
router.post(
  '/razorpay',
  express.raw({ type: '*/*' }),
  async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[RazorpayWebhook] ❌ RAZORPAY_WEBHOOK_SECRET not configured on server');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!signature) {
      console.warn('[RazorpayWebhook] ❌ Missing X-Razorpay-Signature header');
      return res.status(400).json({ error: 'Missing X-Razorpay-Signature header' });
    }

    // Extract raw body bytes exactly as sent by Razorpay
    let rawBody: string | Buffer;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
      rawBody = req.rawBody;
    } else {
      rawBody = JSON.stringify(req.body);
    }

    // Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    const isSignatureValid =
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    if (!isSignatureValid) {
      console.warn('[RazorpayWebhook] ❌ Invalid signature verification');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Parse verified JSON event
    let eventData: RazorpayWebhookPayload;
    try {
      eventData = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
    } catch (parseErr) {
      console.error('[RazorpayWebhook] Failed to parse JSON event body:', parseErr);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    const eventName = eventData.event;
    console.log(`[RazorpayWebhook] 🔔 Received verified event: '${eventName}'`);

    // Handle only "payment.captured" and "order.paid". Ignore all other events with 200.
    if (eventName !== 'payment.captured' && eventName !== 'order.paid') {
      console.log(`[RazorpayWebhook] Ignoring unhandled event: '${eventName}'`);
      return res.status(200).json({ received: true, ignored: true });
    }

    // Always respond 200 to Razorpay quickly so webhook delivery doesn't time out
    res.status(200).json({ received: true, status: 'processing' });

    // Asynchronously process the order & send WhatsApp notifications
    (async () => {
      try {
        const paymentEntity = eventData.payload?.payment?.entity;
        const orderEntity = eventData.payload?.order?.entity;

        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
        const razorpayPaymentId = paymentEntity?.id;

        console.log(`[RazorpayWebhook] Looking up order for Razorpay Order ID: '${razorpayOrderId}', Payment ID: '${razorpayPaymentId}'`);

        // Look up the order in MongoDB
        const order: any = await ordersStorage.findOrderByRazorpayIds(razorpayOrderId, razorpayPaymentId);

        if (!order) {
          console.warn(
            `[RazorpayWebhook] ⚠️ No order found matching Razorpay Order: '${razorpayOrderId}' or Payment: '${razorpayPaymentId}'. It may not be inserted yet or was an external transaction.`
          );
          return;
        }

        console.log(`[RazorpayWebhook] ✅ Order found: #${order.orderNumber || order.id}`);

        // Mark order payment status as paid if not already
        if (order.paymentStatus !== 'paid') {
          await ordersStorage.markOrderAsPaid(order.id, razorpayPaymentId);
          order.paymentStatus = 'paid';
          if (razorpayPaymentId) {
            order.paymentId = razorpayPaymentId;
          }
        }

        // Trigger WhatsApp notifications idempotently
        await processOrderWhatsAppNotifications(order);
      } catch (asyncErr: any) {
        console.error('[RazorpayWebhook] Error processing order notifications asynchronously:', asyncErr?.message || asyncErr);
      }
    })();
  }
);

// ==========================================
// WEBHOOK ENDPOINT: /api/webhooks/whatsapp
// ==========================================

/**
 * GET /api/webhooks/whatsapp
 * Meta WhatsApp Cloud API Webhook Verification handshake.
 * Meta sends hub.mode, hub.verify_token, and hub.challenge.
 */
router.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN || 'planet_mini_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsAppWebhook] ✅ Webhook verified successfully by Meta!');
    return res.status(200).send(challenge);
  }

  console.warn(
    `[WhatsAppWebhook] ❌ Webhook verification failed. Expected '${expectedToken}', got '${token}'`
  );
  return res.sendStatus(403);
});

/**
 * POST /api/webhooks/whatsapp
 * Receives incoming WhatsApp message status updates (sent, delivered, read) and customer replies.
 */
router.post('/whatsapp', (req: Request, res: Response) => {
  const body = req.body;

  // Check if this is an event from a WhatsApp Business Account
  if (body?.object === 'whatsapp_business_account') {
    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        // Message status updates (sent, delivered, read, failed)
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            console.log(
              `[WhatsAppWebhook] 📬 Status update: ID=${status.id}, Status=${status.status}, To=${status.recipient_id}`
            );
            if (status.errors && status.errors.length > 0) {
              console.error(
                `[WhatsAppWebhook] ⚠️ Delivery Error:`,
                JSON.stringify(status.errors)
              );
            }
          }
        }

        // Incoming customer messages
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            console.log(
              `[WhatsAppWebhook] 💬 Incoming message from ${message.from}: type=${message.type}`
            );
          }
        }
      }
    }

    // Always acknowledge with 200 OK so Meta doesn't retry
    return res.sendStatus(200);
  }

  return res.sendStatus(404);
});

export default router;
