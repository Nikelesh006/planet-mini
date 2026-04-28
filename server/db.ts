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



    console.log('⚠️ Continuing without MongoDB connection...');



    // Don't exit, just continue without DB connection



  }



};







// Simple in-memory storage for products (fallback when MongoDB is not available)



let productsCache: any[] = [];







// Clear the cache on startup to ensure clean state



console.log(`🗑️ Clearing products cache on startup. Previous cache had ${productsCache.length} items`);



productsCache = [];







export const productsStorage = {



  async getProducts() {



    try {



      const db = mongoose.connection.db;



      if (!db) throw new Error("Database not connected");



      const products = await db.collection("products").find({}).toArray();



      console.log(`✅ Retrieved ${products.length} products from MongoDB`);



      // Convert MongoDB _id to string id for frontend compatibility



      return products.map(product => ({



        ...product,



        id: product._id.toString()



      }));



    } catch (error) {



      console.log(`❌ MongoDB error: ${(error as Error).message}`);



      console.log(`🔄 Using products cache with ${productsCache.length} items`);



      if (process.env.NODE_ENV === 'development') {



        console.warn("MongoDB not available, using cache");



      }



      return productsCache;



    }



  },







  async getProductById(id: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log(`❌ Database not connected for getProductById, using cache`);
        console.log(`🔄 Searching for product with id: ${id} in cache (${productsCache.length} items)`);
        return productsCache.find(p => p.id === id || p._id?.toString() === id);
      }
      const { ObjectId } = mongoose.Types;
      const product = await db.collection("products").findOne({ _id: new ObjectId(id) });
      if (product) {
        return {
          ...product,
          id: product._id.toString()
        };
      }
      return product;
    } catch (error) {
      console.log(`❌ MongoDB error in getProductById: ${(error as Error).message}`);
      console.log(`🔄 Using products cache with ${productsCache.length} items`);
      if (process.env.NODE_ENV === 'development') {
        console.warn("MongoDB not available, using cache");
      }
      return productsCache.find(p => p.id === id || p._id?.toString() === id);
    }

  },

  async getProductBySlug(slug: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log(`❌ Database not connected for getProductBySlug, using cache`);

        console.log(`🔄 Searching for product with slug: ${slug} in cache (${productsCache.length} items)`);

        return productsCache.find(p => p.slug === slug);

      }

      const product = await db.collection("products").findOne({ slug });

      if (product) {

        return { ...product, id: product._id.toString() };

      }

      return product;

    } catch (error) {

      console.log(`❌ MongoDB error in getProductBySlug: ${(error as Error).message}`);

      console.log(`🔄 Using products cache with ${productsCache.length} items`);

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



  },







  async updateProduct(id: string, updateData: any) {



    try {



      const db = mongoose.connection.db;



      if (!db) throw new Error("Database not connected");



      const { ObjectId } = mongoose.Types;



      



      const result = await db.collection("products").updateOne(



        { _id: new ObjectId(id) },



        { $set: updateData }



      );



      



      if (result.matchedCount === 0) {



        return null;



      }



      



      // Return the updated product



      const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(id) });



      return updatedProduct ? { ...updatedProduct, id: updatedProduct._id.toString() } : null;



    } catch (error) {



      if (process.env.NODE_ENV === 'development') {



        console.warn("MongoDB not available, updating cache");



      }



      // Update in cache



      const index = productsCache.findIndex(p => p.id === id);



      if (index !== -1) {



        productsCache[index] = { ...productsCache[index], ...updateData };



        return productsCache[index];



      }



      return null;



    }



  },







  async deleteProduct(id: string) {



    try {



      const db = mongoose.connection.db;



      if (!db) throw new Error("Database not connected");



      const { ObjectId } = mongoose.Types;



      const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) });



      return result.deletedCount > 0;



    } catch (error) {



      if (process.env.NODE_ENV === 'development') {



        console.warn("MongoDB not available, removing from cache");



      }



      const initialLength = productsCache.length;



      productsCache = productsCache.filter(p => p.id !== id);



      return productsCache.length < initialLength;



    }



  }



};



