import 'dotenv/config';
import {
  sendTemplate,
  sendAdminOrderAlert,
  sendCustomerConfirmation,
  formatWhatsAppPhone
} from '../services/whatsapp.service.js';

/**
 * Test script to verify Meta WhatsApp Cloud API template delivery
 * for both Admin Order Alert and Customer Order Confirmation.
 *
 * Usage:
 *   npx tsx server/scripts/test-whatsapp-templates.ts
 */
async function main() {
  console.log('=====================================================');
  console.log('🚀 Testing Meta WhatsApp Cloud API Templates');
  console.log('=====================================================');

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminPhone =
    process.env.ADMIN_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_ADMIN_NUMBER ||
    process.env.WHATSAPP_ADMIN_PHONE_NUMBER ||
    process.env.OWNER_WHATSAPP_NUMBER;

  console.log('Configuration check:');
  console.log(`- Phone Number ID: ${phoneNumberId || '❌ MISSING'}`);
  console.log(`- Access Token:    ${accessToken ? '✅ Present' : '❌ MISSING'}`);
  console.log(`- Admin Number:    ${adminPhone ? formatWhatsAppPhone(adminPhone) : '❌ MISSING'}`);
  console.log(`- Admin Template:  ${process.env.WHATSAPP_ADMIN_TEMPLATE || 'admin_order_alert'}`);
  console.log(`- Cust Template:   ${process.env.WHATSAPP_CUSTOMER_TEMPLATE || 'order_confirmation_customer'}`);
  console.log('-----------------------------------------------------\n');

  if (!phoneNumberId || !accessToken || !adminPhone) {
    console.error('❌ Cannot proceed: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, or ADMIN_WHATSAPP_NUMBER is missing in .env');
    process.exit(1);
  }

  // Sample Order Data matching Planet Mini schema
  const sampleOrder = {
    id: 'test_order_65f0123456789abcdef01234',
    orderNumber: 'TRIC-PM-ORD-TEST',
    total: 1499,
    paymentId: 'pay_test_' + Date.now().toString().slice(-6),
    paymentStatus: 'paid',
    items: [
      {
        productId: 'prod_001',
        name: 'Organic Cotton Baby Romper',
        size: '6-12 Months',
        quantity: 2,
        sellingPrice: 499,
        description: 'Soft breathable 100% organic cotton baby sleepsuit with snap buttons',
        slug: 'organic-cotton-baby-romper'
      },
      {
        productId: 'prod_002',
        name: 'Cozy Fleece Baby Booties',
        size: 'Standard',
        quantity: 1,
        sellingPrice: 501,
        description: 'Warm and gentle anti-slip fleece booties for newborns and toddlers',
        slug: 'cozy-fleece-baby-booties'
      }
    ],
    shippingAddress: {
      fullName: 'Nikelesh',
      phone: adminPhone || '919597755722',
      street: '14 Gandhi Road, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040'
    },
    whatsappAdminSent: false,
    whatsappCustomerSent: false
  };

  // 0. Live Connection & Delivery Check using Meta's pre-approved 'hello_world'
  console.log('0️⃣ Verifying live delivery to ' + adminPhone + ' with pre-approved "hello_world" template...');
  try {
    const hwRes = await sendTemplate(adminPhone, 'hello_world', 'en_US', []);
    if (hwRes.success) {
      console.log(`🎉 LIVE DELIVERY SUCCESSFUL! Message ID: ${hwRes.messageId}`);
      console.log('   Check WhatsApp on your phone ' + adminPhone + '! The message just arrived!\n');
    } else {
      console.log(`⚠️ Hello World delivery result: ${hwRes.error}\n`);
    }
  } catch (hwErr: any) {
    console.error('Hello world error:', hwErr?.message || hwErr);
  }

  // 1. Test Admin Order Alert
  console.log('1️⃣ Sending TEMPLATE 1: admin_order_alert to Admin...');
  try {
    const adminResult = await sendAdminOrderAlert(sampleOrder);
    if (adminResult.success) {
      console.log(`✅ Admin Order Alert SUCCESS! Message ID: ${adminResult.messageId || 'Delivered'}`);
    } else {
      console.error(`❌ Admin Order Alert FAILED: ${adminResult.error}`);
    }
  } catch (err: any) {
    console.error('❌ Exception in Admin Order Alert:', err?.message || err);
  }

  console.log('\n-----------------------------------------------------\n');

  // 2. Test Customer Order Confirmation
  console.log('2️⃣ Sending TEMPLATE 2: order_confirmation_customer to Customer...');
  try {
    const customerResult = await sendCustomerConfirmation(sampleOrder);
    if (customerResult.success) {
      console.log(`✅ Customer Order Confirmation SUCCESS! Message ID: ${customerResult.messageId || 'Delivered'}`);
    } else {
      console.error(`❌ Customer Order Confirmation FAILED: ${customerResult.error}`);
    }
  } catch (err: any) {
    console.error('❌ Exception in Customer Confirmation:', err?.message || err);
  }

  console.log('\n=====================================================');
  console.log('🏁 Test execution finished.');
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
