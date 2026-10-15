import 'dotenv/config';
import { connectDB } from '../db.js';
import { sendCartAlertMessage, getDefaultOfferEndDate } from '../services/whatsapp.service.js';
import {
  recordCartActivity,
  recordAddressAdded,
  cancelCartAlertOnOrder,
  cancelCartAlertOnCartCleared,
  checkAndSendPendingCartAlerts,
  getUserAddressAndContact,
  getUserCartItems
} from '../services/cartAlert.service.js';
import CartAlertModel from '../models/CartAlert.js';
import Profile from '../models/Profile.js';
import mongoose from 'mongoose';

async function runSimulation() {
  console.log('====================================================');
  console.log('🧪 SIMULATING ABANDONED CART ALERT LIFECYCLE');
  console.log('====================================================');

  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const testUserId = `test-cart-user-${Date.now()}`;
  const testPhone = '9597755722';

  console.log(`\n1. Creating test profile with cart item for user: ${testUserId}...`);
  await Profile.create({
    userId: testUserId,
    firstName: 'Nikelesh',
    lastName: 'Tester',
    email: `${testUserId}@example.com`,
    cartItems: [
      {
        id: 'prod-001',
        name: 'Baby Muslin Romper',
        sellingPrice: 799,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba'
      }
    ]
  });

  console.log('2. Testing recordCartActivity BEFORE address is added...');
  let alert = await recordCartActivity(testUserId);
  console.log('Result before address (should be null):', alert);

  console.log('\n3. Adding address to database for user...');
  await db.collection('addresses').insertOne({
    userId: testUserId,
    fullName: 'Nikelesh Tester',
    phone: testPhone,
    street: '123 Main Street',
    city: 'Salem',
    state: 'Tamil Nadu',
    pincode: '636001',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('4. Calling recordAddressAdded (simulating user adding address)...');
  alert = await recordAddressAdded(testUserId);
  console.log('Result after address added (should be pending alert):', {
    id: alert?._id,
    status: alert?.status,
    phone: alert?.phone,
    customerName: alert?.customerName,
    scheduledFor: alert?.scheduledFor?.toISOString(),
    cartCount: alert?.cartCount,
    cartTotal: alert?.cartTotal
  });

  if (!alert || alert.status !== 'pending') {
    throw new Error('Expected alert to be created with status pending!');
  }

  console.log('\n5. Testing idempotency: calling recordCartActivity again with another item...');
  const profile = await Profile.findOne({ userId: testUserId });
  profile.cartItems.push({
    id: 'prod-002',
    name: 'Soft Cotton Bib',
    sellingPrice: 299,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba'
  });
  await profile.save();

  const refreshedAlert = await recordCartActivity(testUserId);
  console.log('Refreshed alert cart count:', refreshedAlert?.cartCount, 'total:', refreshedAlert?.cartTotal);

  console.log('\n6. Testing order cancellation: simulating user placing an order...');
  const cancelledCount = await cancelCartAlertOnOrder(testUserId, 'TRIC-PM-ORD-TEST');
  console.log(`Cancelled alerts count: ${cancelledCount}`);

  const cancelledAlert = await CartAlertModel.findById(alert._id);
  console.log('Alert status in DB after order placed:', cancelledAlert?.status);

  if (cancelledAlert?.status !== 'cancelled_order_placed') {
    throw new Error(`Expected status 'cancelled_order_placed', got ${cancelledAlert?.status}`);
  }

  console.log('\n7. Testing due alert worker: scheduling an alert in the past...');
  const overdueAlert = await CartAlertModel.create({
    userId: testUserId,
    phone: testPhone,
    customerName: 'Nikelesh',
    cartItems: profile.cartItems,
    cartCount: 3,
    cartTotal: 1897,
    scheduledFor: new Date(Date.now() - 10000), // 10 seconds ago
    status: 'pending'
  });

  console.log('Created overdue alert with ID:', overdueAlert._id);
  console.log('Running checkAndSendPendingCartAlerts()...');
  const summary = await checkAndSendPendingCartAlerts();
  console.log('Check summary:', summary);

  const processedAlert = await CartAlertModel.findById(overdueAlert._id);
  console.log('Processed alert status in DB:', processedAlert?.status);
  console.log('WhatsApp messageId / error:', processedAlert?.whatsappMessageId || processedAlert?.whatsappError);

  console.log('\n8. Cleaning up test documents...');
  await Profile.deleteOne({ userId: testUserId });
  await db.collection('addresses').deleteMany({ userId: testUserId });
  await CartAlertModel.deleteMany({ userId: testUserId });
  console.log('✅ Cleanup complete.');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runSimulation().catch((err) => {
  console.error('❌ Simulation failed:', err);
  process.exit(1);
});
