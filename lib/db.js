// lib/db.js
import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL;
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const client = new MongoClient(uri);
  await client.connect();
  cachedDb = client.db('planet_mini');
  console.log('✅ MongoDB Connected');
  return cachedDb;
}

export default connectToDatabase;
