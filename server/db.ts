import mongoose from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

export const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Simple in-memory storage for products (fallback when MongoDB is not available)
let productsCache: any[] = [];

export const productsStorage = {
  async getProducts() {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      const products = await db.collection("products").find({}).toArray();
      return products;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("MongoDB not available, using cache");
      }
      return productsCache;
    }
  },

  async getProductBySlug(slug: string) {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      const product = await db.collection("products").findOne({ slug });
      return product;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("MongoDB not available, using cache");
      }
      return productsCache.find(p => p.slug === slug);
    }
  },

  async createProduct(product: any) {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      const result = await db.collection("products").insertOne(product);
      return { ...product, _id: result.insertedId };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("MongoDB not available, adding to cache");
      }
      const newProduct = { ...product, id: productsCache.length + 1 };
      productsCache.push(newProduct);
      return newProduct;
    }
  }
};
