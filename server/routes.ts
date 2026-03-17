import type { Express } from "express";

import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";

import { storage, addressStorage, ordersStorage, userStorage } from "./storage";

// Define user type for auth middleware
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

// Auth middleware for user isolation
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN[1]
  
  console.log('🔐 Auth check:', { authHeader, hasToken: !!token, tokenValue: token });
  
  // TEMPORARY BYPASS FOR TESTING - Remove in production
  if (!token || token === 'null' || token === 'undefined') {
    console.log('⚠️ TEMP: Using test user for null token');
    req.user = { 
      sub: 'test-user-123', 
      id: 'test-user-123', 
      email: 'test@example.com' 
    };
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  console.log('🔑 Using JWT secret:', jwtSecret ? 'Set' : 'Not set');

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      console.log('❌ Token verification failed:', {
        error: err.message,
        name: err.name,
        expired: err.expired,
        token: token.substring(0, 50) + '...'
      });
      return res.status(403).json({ 
        error: 'Invalid token',
        details: err.message,
        suggestion: 'Please login again to get a fresh token'
      });
    }
    
    console.log('✅ Token verified successfully:', { 
      userId: user?.sub || user?.id || user?.userId,
      email: user?.email 
    });
    
    req.user = user;
    next();
  });
};



import { api } from "@shared/routes";



import { z } from "zod";



import profileRoutes from "./routes/profile";

import authRoutes from "./routes/auth";

import uploadRoutes from "./routes/upload";

import addressRoutes from "./routes/addresses";







export async function registerRoutes(



  httpServer: Server,



  app: Express



): Promise<Server> {



  



  app.get(api.products.list.path, async (req, res) => {
    try {
      const allProducts = await storage.getProducts();

      let filtered = allProducts;
      
      // Filter by category
      if (req.query?.category && typeof req.query.category === 'string') {
        const categoryLower = req.query.category.toLowerCase();
        filtered = filtered.filter(p => 
          p.category?.toLowerCase() === categoryLower
        );
      }
      
      // Filter by subcategory
      if (req.query?.subcategory && typeof req.query.subcategory === 'string') {
        const subcategoryLower = req.query.subcategory.toLowerCase();
        filtered = filtered.filter(p => 
          p.subcategory?.toLowerCase() === subcategoryLower
        );
      }
      
      // Only show in-stock products (MongoDB stores actual booleans)
      filtered = filtered.filter(p => p.inStock === true);
      
      // Sort: isNew descending, then rating descending
      filtered.sort((a, b) => {
        // First sort by isNew (descending)
        if (a.isNew !== b.isNew) {
          return (b.isNew === true) ? 1 : -1;
        }
        // Then sort by rating (descending)
        return (b.rating || 0) - (a.rating || 0);
      });
      
      // Apply search filter if provided
      if (req.query?.search && typeof req.query.search === 'string') {
        const searchLower = req.query.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name?.toLowerCase().includes(searchLower) || 
          p.description?.toLowerCase().includes(searchLower)
        );
      }
      
      res.json(filtered);
    } catch (err) {
      res.status(400).json({ message: "Invalid query parameters" });
    }
  });


  app.post(api.products.list.path, async (req, res) => {
    try {

      const productData = req.body;

      

      // Create a new product

      const newProduct = await storage.createProduct(productData);

      

      res.status(201).json(newProduct);

    } catch (error) {

      console.error('Error creating product:', error);

      res.status(500).json({ message: "Failed to create product" });

    }

  });



  // GET product by ID (for edit functionality)
  app.get("/api/products/id/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      // Get all products and find by ID
      const products = await storage.getProducts();
      const product = products.find(p => p.id.toString() === productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {

    const product = await storage.getProductBySlug(req.params.slug);

    if (!product) {

      return res.status(404).json({ message: "Product not found" });

    }

    res.json(product);

  });

  // PATCH endpoint for updating products by slug
  app.patch(api.products.get.path, async (req, res) => {
    try {
      const productSlug = req.params.slug;
      const updateData = req.body;
      
      if (!productSlug) {
        return res.status(400).json({ message: "Invalid product slug" });
      }
      
      // Get product by slug to find ID
      const existingProduct = await storage.getProductBySlug(productSlug);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Update product using storage - convert id to string
      const updatedProduct = await storage.updateProduct(existingProduct.id.toString(), updateData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PUT endpoint for updating products (for edit functionality)
  app.put("/api/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const updateData = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Update product using storage
      const updatedProduct = await storage.updateProduct(productId, updateData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {

    try {

      const productId = req.params.id;

      if (!productId) {

        return res.status(400).json({ message: "Invalid product ID" });

      }

      // Delete product using MongoDB _id

      await storage.deleteProduct(productId);

      res.json({ message: "Product deleted successfully" });

    } catch (error) {

      console.error("Error deleting product:", error);

      res.status(500).json({ message: "Internal server error" });

    }

  });

  // Profile routes

  app.use('/api/profile', profileRoutes);



  // Auth routes

  app.use('/api/auth', authRoutes);



  // Upload routes

  app.use('/api/upload', uploadRoutes);


  // Address routes

  app.use('/api/addresses', addressRoutes);

  // Debug endpoint to check token
  app.post('/api/debug-token', async (req: any, res: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔍 Debug token request:', { authHeader, hasToken: !!token });
    
    if (!token) {
      return res.json({ error: 'No token provided' });
    }

    try {
      // Try to decode without verification first
      const decoded = jwt.decode(token);
      console.log('🔓 Decoded token (no verification):', decoded);
      
      // Try to verify
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const verified = jwt.verify(token, jwtSecret);
      console.log('✅ Verified token:', verified);
      
      res.json({ 
        decoded,
        verified,
        jwtSecret: jwtSecret.substring(0, 10) + '...'
      });
    } catch (error: any) {
      console.log('❌ Token error:', error.message);
      res.json({ 
        error: error.message,
        name: error.name,
        token: token.substring(0, 50) + '...'
      });
    }
  });

  // Orders routes - PROTECTED with user isolation
  app.post('/api/orders', authenticateToken, async (req: any, res: any) => {
    try {
      console.log('🛒 Order request received:', {
        body: req.body,
        user: req.user,
        headers: req.headers
      });

      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        console.log('❌ No userId found in token');
        return res.status(401).json({ error: 'Unauthorized - No user ID' });
      }

      const { items, shippingAddressId, total } = req.body;
      console.log('📦 Order data:', { items, shippingAddressId, total, userId });

      if (!items || !shippingAddressId || !total) {
        console.log('❌ Missing required fields:', { items: !!items, shippingAddressId: !!shippingAddressId, total: !!total });
        return res.status(400).json({ message: 'Missing required order fields' });
      }

      const orderNumber = `PM${Date.now().toString().slice(-6)}`;
      console.log('🔢 Generated order number:', orderNumber);

      const orderData = {
        userId,
        orderNumber,
        items: items.map((item: any) => ({
          productId: item.productId || item.id,
          productName: item.productName || item.name,
          image: item.image,
          price: item.price,
          size: item.size || 'N/A',
          color: item.color || 'N/A',
          quantity: item.quantity
        })),
        shippingAddressId,
        subtotal: total - 35,
        shipping: 35,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('💾 Creating order with data:', orderData);
      const order = await ordersStorage.createOrder(orderData);
      
      if (!order) {
        console.log('❌ Failed to create order in storage');
        return res.status(500).json({ message: 'Failed to create order - Storage error' });
      }

      console.log('✅ Order created successfully:', order);

      // Clear user's cart after successful order
      console.log('🗑️ Clearing cart for user:', userId);
      await userStorage.clearCart(userId);

      res.status(201).json(order);
    } catch (error) {
      console.error('💥 Order creation error:', {
        error: error,
        message: (error as Error).message,
        stack: (error as Error).stack,
        body: req.body,
        user: req.user
      });
      res.status(500).json({ 
        message: 'Failed to create order',
        error: (error as Error).message,
        details: 'Unknown error occurred during order creation'
      });
    }
  });

  app.get('/api/orders', authenticateToken, async (req: any, res: any) => {
    try {
      console.log('📋 Orders request received:', { 
        user: req.user, 
        headers: req.headers 
      });
      
      const userId = req.user?.sub || req.user?.id;
      console.log('👤 Extracted userId:', { userId, userSub: req.user?.sub, userIdFromUser: req.user?.id });
      
      if (!userId) {
        console.log('❌ No userId found in request');
        return res.status(401).json({ 
          success: false,
          message: 'Unauthorized - No user ID',
          code: 'NO_USER_ID'
        });
      }

      console.log('🔍 Fetching orders for userId:', userId);
      const orders = await ordersStorage.getOrders(userId);
      console.log('📦 Retrieved orders count:', orders.length, 'for user:', userId);
      
      // Return direct array for frontend compatibility
      res.json(orders);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch orders',
        code: 'SERVER_ERROR'
      });
    }
  });

  // Dedicated endpoint for frontend - /api/orders/my-orders
  app.get('/api/orders/my-orders', authenticateToken, async (req: any, res: any) => {
    try {
      console.log('📋 My Orders request received:', { 
        user: req.user, 
        headers: req.headers 
      });
      
      const userId = req.user?.sub || req.user?.id;
      console.log('👤 My Orders - Extracted userId:', { userId, userSub: req.user?.sub, userIdFromUser: req.user?.id });
      
      if (!userId) {
        console.log('❌ My Orders - No userId found in request');
        return res.status(401).json({ 
          success: false,
          message: 'Unauthorized - No user ID',
          code: 'NO_USER_ID'
        });
      }

      console.log('🔍 My Orders - Fetching orders for userId:', userId);
      const orders = await ordersStorage.getOrders(userId);
      console.log('📦 My Orders - Retrieved orders count:', orders.length, 'for user:', userId);
      
      // Return with proper structure for frontend
      res.json({
        success: true,
        orders: orders,
        userId: userId,
        count: orders.length
      });
    } catch (error) {
      console.error('❌ My Orders - Error fetching orders:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch orders',
        code: 'SERVER_ERROR'
      });
    }
  });

  // Cart routes - PROTECTED with user isolation
  app.get('/api/cart', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const cart = await userStorage.getCart(userId);
      res.json(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to fetch cart' });
    }
  });

  app.post('/api/cart', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId, quantity, size, color } = req.body;
      const cartItem = await userStorage.addToCart(userId, {
        productId,
        quantity: quantity || 1,
        size,
        color
      });
      
      if (cartItem) {
        res.status(201).json(cartItem);
      } else {
        res.status(500).json({ message: 'Failed to add to cart' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Failed to add to cart' });
    }
  });

  app.put('/api/cart/:productId', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId } = req.params;
      const { quantity, size, color } = req.body;
      
      const updated = await userStorage.updateCartItem(userId, productId, {
        quantity,
        size,
        color
      });
      
      if (updated) {
        res.json({ message: 'Cart item updated' });
      } else {
        res.status(404).json({ message: 'Cart item not found' });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ message: 'Failed to update cart' });
    }
  });

  app.delete('/api/cart/:productId', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId } = req.params;
      const deleted = await userStorage.removeFromCart(userId, productId);
      
      if (deleted) {
        res.json({ message: 'Cart item removed' });
      } else {
        res.status(404).json({ message: 'Cart item not found' });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ message: 'Failed to remove from cart' });
    }
  });

  app.delete('/api/cart', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const deletedCount = await userStorage.clearCart(userId);
      res.json({ message: `Cart cleared, removed ${deletedCount} items` });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Failed to clear cart' });
    }
  });

  // Wishlist routes - PROTECTED with user isolation
  app.get('/api/wishlist', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const wishlist = await userStorage.getWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ message: 'Failed to fetch wishlist' });
    }
  });

  app.post('/api/wishlist', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId } = req.body;
      const wishlistItem = await userStorage.addToWishlist(userId, productId);
      
      if (wishlistItem) {
        res.status(201).json(wishlistItem);
      } else {
        res.status(500).json({ message: 'Failed to add to wishlist' });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ message: 'Failed to add to wishlist' });
    }
  });

  app.delete('/api/wishlist/:productId', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId } = req.params;
      const removed = await userStorage.removeFromWishlist(userId, productId);
      
      if (removed) {
        res.json({ message: 'Wishlist item removed' });
      } else {
        res.status(404).json({ message: 'Wishlist item not found' });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
  });

  app.get('/api/wishlist/check/:productId', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId } = req.params;
      const isInWishlist = await userStorage.isInWishlist(userId, productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error('Error checking wishlist:', error);
      res.status(500).json({ message: 'Failed to check wishlist' });
    }
  });

  return httpServer;
}
