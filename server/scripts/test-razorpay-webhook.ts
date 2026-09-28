import 'dotenv/config';
import crypto from 'crypto';
import axios from 'axios';
import { app } from '../index.js';
import type { Server } from 'http';

/**
 * End-to-end test script for the Razorpay Webhook endpoint.
 * Tests HMAC SHA256 signature verification and event processing.
 *
 * Usage:
 *   npx tsx server/scripts/test-razorpay-webhook.ts
 */
async function testWebhook() {
  // Start server on a free random port
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const address = server.address() as any;
  const port = address.port;
  const baseURL = `http://localhost:${port}/api/webhooks/razorpay`;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '4bfbc6e21a80fdb81cc5da5c4e52ac552ca0151d07bef2f6';

  console.log('=====================================================');
  console.log('🧪 Testing Razorpay Webhook Endpoint');
  console.log(`Endpoint: ${baseURL}`);
  console.log('=====================================================\n');

  // Test 1: Invalid Signature
  console.log('Test 1: Request with INVALID signature (expecting 400)...');
  try {
    const payload = JSON.stringify({ entity: 'event', event: 'payment.captured' });
    await axios.post(baseURL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'invalid_signature_hex_1234567890'
      }
    });
    console.error('❌ Test 1 FAILED: Expected 400, but request succeeded');
  } catch (err: any) {
    if (err.response?.status === 400) {
      console.log('✅ Test 1 PASSED: Server rejected invalid signature with 400 Bad Request');
    } else {
      console.error(`❌ Test 1 FAILED: Unexpected status ${err.response?.status}:`, err.response?.data);
    }
  }

  // Test 2: Ignored Event (e.g. refund.created)
  console.log('\nTest 2: Request with ignored event (expecting 200)...');
  try {
    const payload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'refund.created',
      contains: ['refund'],
      payload: {},
      created_at: Math.floor(Date.now() / 1000)
    });
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await axios.post(baseURL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature
      }
    });

    if (res.status === 200 && res.data?.ignored === true) {
      console.log('✅ Test 2 PASSED: Server ignored non-payment event with 200 OK');
    } else {
      console.error('❌ Test 2 FAILED: Response was not as expected:', res.data);
    }
  } catch (err: any) {
    console.error('❌ Test 2 FAILED:', err.response?.data || err.message);
  }

  // Test 3: Valid payment.captured event
  console.log('\nTest 3: Request with valid payment.captured event (expecting 200)...');
  try {
    const payload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_test_wh_' + Date.now().toString().slice(-6),
            order_id: 'order_test_wh_' + Date.now().toString().slice(-6),
            amount: 149900,
            currency: 'INR',
            status: 'captured',
            method: 'upi',
            email: 'customer@example.com',
            contact: '+919597755722',
            created_at: Math.floor(Date.now() / 1000)
          }
        }
      },
      created_at: Math.floor(Date.now() / 1000)
    });
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await axios.post(baseURL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature
      }
    });

    if (res.status === 200 && res.data?.status === 'processing') {
      console.log('✅ Test 3 PASSED: Server accepted payment.captured event with 200 OK');
      console.log('   Response:', res.data);
    } else {
      console.error('❌ Test 3 FAILED: Response was:', res.data);
    }
  } catch (err: any) {
    console.error('❌ Test 3 FAILED:', err.response?.data || err.message);
  }

  // Test 4: Valid order.paid event
  console.log('\nTest 4: Request with valid order.paid event (expecting 200)...');
  try {
    const payload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'order.paid',
      contains: ['order', 'payment'],
      payload: {
        order: {
          entity: {
            id: 'order_paid_wh_' + Date.now().toString().slice(-6),
            amount: 149900,
            amount_paid: 149900,
            currency: 'INR',
            status: 'paid',
            attempts: 1,
            created_at: Math.floor(Date.now() / 1000)
          }
        },
        payment: {
          entity: {
            id: 'pay_paid_wh_' + Date.now().toString().slice(-6),
            amount: 149900,
            status: 'captured'
          }
        }
      },
      created_at: Math.floor(Date.now() / 1000)
    });
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await axios.post(baseURL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature
      }
    });

    if (res.status === 200 && res.data?.status === 'processing') {
      console.log('✅ Test 4 PASSED: Server accepted order.paid event with 200 OK');
      console.log('   Response:', res.data);
    } else {
      console.error('❌ Test 4 FAILED: Response was:', res.data);
    }
  } catch (err: any) {
    console.error('❌ Test 4 FAILED:', err.response?.data || err.message);
  }

  server.close();
  console.log('\n=====================================================');
  console.log('🏁 Webhook test suite finished.');
  console.log('=====================================================');
  process.exit(0);
}

testWebhook().catch((err) => {
  console.error('Fatal webhook test error:', err);
  process.exit(1);
});
