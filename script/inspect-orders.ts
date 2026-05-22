import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function inspect() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in .env file');
      return;
    }
    
    await mongoose.connect(process.env.DATABASE_URL);
    const db = mongoose.connection.db;
    if (!db) {
      console.error('❌ DB is undefined');
      return;
    }
    
    const orders = await db.collection("orders").find({}).limit(5).toArray();
    console.log('--- INSPECTING ORDERS (Limit 5) ---');
    orders.forEach(order => {
      console.log(`Order ${order.orderNumber || order._id}:`);
      console.log('  shippingAddressId:', order.shippingAddressId);
      console.log('  shippingAddress:', JSON.stringify(order.shippingAddress));
      console.log('  address:', JSON.stringify(order.address));
    });

    const addresses = await db.collection("addresses").find({}).limit(5).toArray();
    console.log('--- INSPECTING ADDRESSES (Limit 5) ---');
    addresses.forEach(addr => {
      console.log(`Address ${addr._id}:`);
      console.log('  Keys:', Object.keys(addr));
      console.log('  Data:', JSON.stringify(addr));
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error during inspection:', error);
  }
}

inspect();
