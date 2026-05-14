import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SoPV94HPAl2TGh',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '6B4unROD9vBq42OyL9pI4efA'
});

// ✅ MIDDLEWARE: Check both cookies and Authorization header
const requireAuth = (req: any, res: any, next: any) => {
  // Check cookie first, then Authorization header
  let token = req.cookies?.jwt;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('jwt');
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. POST /api/payment/create-order  ← Create Razorpay order
router.post('/create-order', requireAuth, async (req: any, res: any) => {
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
router.post('/verify', requireAuth, async (req: any, res: any) => {
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

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '6B4unROD9vBq42OyL9pI4efA')
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('❌ Payment signature verification failed');
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    console.log('✅ Payment verified successfully:', razorpay_payment_id);

    // Here you can:
    // 1. Update order status in database
    // 2. Send confirmation email
    // 3. Update inventory
    // 4. Create invoice

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
