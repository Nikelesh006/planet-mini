import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ordersStorage } from '../storage.js';
import { productsStorage } from '../db.js';
import { notifyOwnerOnWhatsApp } from '../utils/notifyOwner.js';
import { requireAuth } from '../lib/authMiddleware.js';
import { paymentLimiter } from '../lib/rateLimiters.js';

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// 1. POST /api/payment/create-order  ← Create Razorpay order
router.post('/create-order', paymentLimiter, requireAuth, async (req: any, res: any) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

    console.log('✅ Razorpay order created:', order.id);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });

  } catch (error: any) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error.message 
    });
  }
});

// 2. POST /api/payment/verify  ← Verify payment signature
router.post('/verify', paymentLimiter, requireAuth, async (req: any, res: any) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderData 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification parameters' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('❌ RAZORPAY_KEY_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Payment gateway is misconfigured' });
    }

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('❌ Payment signature verification failed');
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    console.log('✅ Payment signature verified successfully:', razorpay_payment_id);

    // If orderData is supplied (e.g. BundleCheckout), validate payment status & real database prices
    if (orderData) {
      console.log('[VerifyRoute] Validating and creating order on signature verification success');

      // Fetch payment from Razorpay to verify captured state and order ID match
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (payment.status !== 'captured' || payment.order_id !== razorpay_order_id) {
          console.error(`❌ Razorpay payment verification failed: status is ${payment.status}, expected captured`);
          return res.status(400).json({ error: 'Razorpay payment is not captured or order ID mismatch' });
        }

        // Calculate real subtotal from database products to prevent client price tampering
        const products = await productsStorage.getProducts();
        let calculatedSubtotal = 0;
        for (const item of orderData.items || orderData.products || []) {
          const productId = (item.productId || item.id || item._id)?.toString();
          const product = products.find((candidate: any) =>
            candidate.id?.toString() === productId ||
            candidate._id?.toString() === productId ||
            candidate.slug === productId
          );
          const qty = Math.max(1, Number(item.quantity || 1));
          const price = product ? Number(product.sellingPrice || 0) : 0;
          calculatedSubtotal += price * qty;
        }

        const razorpayAmount = Number(payment.amount) / 100;
        const orderTotal = calculatedSubtotal > 0 ? calculatedSubtotal : Number(orderData.total || 0);
        if (Math.abs(razorpayAmount - orderTotal) > 1.0) {
          console.error(`❌ Razorpay verification failed: amount mismatch (${razorpayAmount} vs ${orderTotal})`);
          return res.status(400).json({ error: `Amount mismatch: paid amount does not match order total` });
        }

        const finalOrderData = {
          ...orderData,
          userId: req.user.id,
          total: calculatedSubtotal > 0 ? calculatedSubtotal : orderData.total,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paymentStatus: 'paid',
          status: 'completed'
        };

        const newOrder = await ordersStorage.createOrder(req.user.id, finalOrderData);
        
        console.log('>>> ORDER CREATED SUCCESSFULLY <<<');
        
        // Send WhatsApp notification to owner
        try {
          notifyOwnerOnWhatsApp(newOrder);
        } catch (waError: any) {
          console.error('WhatsApp Notification error:', waError);
        }

        return res.json({
          success: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          order: newOrder,
          message: 'Payment verified and order created successfully'
        });
      } catch (verifErr: any) {
        console.error('❌ Failed to verify payment with Razorpay API:', verifErr);
        return res.status(400).json({
          error: 'Failed to verify payment with payment gateway',
          details: verifErr.message
        });
      }
    }

    res.json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: 'Payment verified successfully'
    });

  } catch (error: any) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.message 
    });
  }
});

// 3. GET /api/payment/orders/:orderId  ← Get order details
router.get('/orders/:orderId', requireAuth, async (req: any, res: any) => {
  try {
    const { orderId } = req.params;

    const order = await razorpay.orders.fetch(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });

  } catch (error: any) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      details: error.message 
    });
  }
});

export default router;
