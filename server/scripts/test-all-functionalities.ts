import 'dotenv/config';
import axios from 'axios';
import {
  sendAdminOrderAlert,
  sendCustomerConfirmation,
  sendCartAlertMessage,
  formatWhatsAppPhone
} from '../services/whatsapp.service.js';

async function testAll() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1420193167833579';
  const testNumber = process.env.ADMIN_WHATSAPP_NUMBER || '918124411259';

  console.log('====================================================');
  console.log('🧪 TESTING ALL 3 WHATSAPP FUNCTIONALITIES');
  console.log(`Sender Phone ID: ${phoneId}`);
  console.log(`Target Phone:    ${testNumber}`);
  console.log('====================================================\n');

  // 1. ADMIN ALERT
  console.log('----------------------------------------------------');
  console.log('1️⃣ TESTING ADMIN FUNCTIONALITY (admin_alert)');
  console.log('----------------------------------------------------');
  try {
    const adminRes = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: testNumber,
        type: 'template',
        template: {
          name: 'admin_alert',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'ORD-TEST-999' },
                { type: 'text', text: '9597755722' },
                { type: 'text', text: 'Paid INR 1499 via Razorpay' },
                { type: 'text', text: '12 Gandhi Road, Salem, 636001' },
                { type: 'text', text: 'https://www.planetmini.in/shop' }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Admin Alert Result:', JSON.stringify(adminRes.data, null, 2));
  } catch (err: any) {
    console.error('❌ Admin Alert Error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }

  // 2. CART FUNCTIONALITY
  console.log('\n----------------------------------------------------');
  console.log('2️⃣ TESTING CART FUNCTIONALITY (cart_function)');
  console.log('----------------------------------------------------');
  try {
    const cartRes = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: testNumber,
        type: 'template',
        template: {
          name: 'cart_function',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'Nikelesh' },
                { type: 'text', text: 'https://www.planetmini.in/cart' },
                { type: 'text', text: '23rd Oct' }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Cart Functionality Result:', JSON.stringify(cartRes.data, null, 2));
  } catch (err: any) {
    console.error('❌ Cart Functionality Error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }

  // 3. ORDER CONFIRMATION
  console.log('\n----------------------------------------------------');
  console.log('3️⃣ TESTING CUSTOMER ORDER CONFIRMATION (customer_order_confirmation)');
  console.log('----------------------------------------------------');
  try {
    const custRes = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: testNumber,
        type: 'template',
        template: {
          name: 'customer_order_confirmation',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'Nikelesh' },
                { type: 'text', text: 'ORD-TEST-999' },
                { type: 'text', text: 'Baby Muslin Romper x 2' },
                { type: 'text', text: '1499' },
                { type: 'text', text: '9597755722' },
                { type: 'text', text: '12 Gandhi Road, Salem' }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Customer Order Confirmation Result:', JSON.stringify(custRes.data, null, 2));
  } catch (err: any) {
    console.error('❌ Customer Confirmation Error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }

  console.log('\n====================================================');
  console.log('🏁 ALL TESTS COMPLETED');
  console.log('====================================================');
}

testAll();
