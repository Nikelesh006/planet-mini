import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in .env file');
      return;
    }
    
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔧 Possible fixes:');
    console.error('  1. Check DATABASE_URL in .env file');
    console.error('  2. Verify MongoDB credentials');
    console.error('  3. Check network access (IP whitelist)');
    console.error('  4. Ensure MongoDB cluster is running');
  }
}

testConnection();
