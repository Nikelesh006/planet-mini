import type { Express } from "express";







import { createServer, type Server } from "http";







import jwt from "jsonwebtoken";















import { storage, addressStorage, userStorage, ordersStorage } from "./storage";







import { api } from "@shared/routes";







import { z } from "zod";







import profileRoutes from "./routes/profile";            







import authRoutes from "./routes/auth";







import uploadRoutes from "./routes/upload";







import addressRoutes from "./routes/addresses";

import paymentRoutes from "./routes/payment";




















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







  







  // For development: Check if this is a Google auth session







  if (!token || token === 'null' || token === 'undefined') {







    // Check if there's a session-based auth (Google OAuth)







    const sessionUserId = req.headers['x-user-id'] || req.query.userId;







    if (sessionUserId && sessionUserId !== 'test-user-123') {







      console.log('✅ Using Google session user ID:', sessionUserId);







      req.user = { 







        sub: sessionUserId, 







        id: sessionUserId, 







        email: req.headers['x-user-email'] || 'user@gmail.com'







      };







      return next();







    }







    







    // Only use test user for explicit testing







    if (sessionUserId === 'test-user-123') {







      console.log('⚠️ TEMP: Using test user for testing');







      req.user = { 







        sub: 'test-user-123', 







        id: 'test-user-123', 







        email: 'test@example.com' 







      };







      return next();







    }







    







    console.log('❌ No authentication found');







    return res.status(401).json({ 







      error: 'No token provided',







      message: 'Authentication required'







    });







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







    







    console.log(' Token verified successfully:', { 







      userId: user?.sub || user?.id || user?.userId,







      email: user?.email 







    });







    







    req.user = user;







    next();







  });







}















export async function registerRoutes(







  httpServer: Server,







  app: Express







): Promise<Server> {







  







  // Products routes







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







      const newProduct = await storage.createProduct(productData);







      res.status(201).json(newProduct);







    } catch (error) {







      console.error('Error creating product:', error);







      res.status(500).json({ message: "Failed to create product" });







    }







  });















  // GET product by slug (for product details page)







  app.get(api.products.get.path, async (req, res) => {







    console.log('🔍 Backend: GET /api/products/:slug called');







    console.log('📝 Backend: slug parameter:', req.params.slug);







    const { slug } = req.params;



    let product;







    // NEW LOGIC: Handle both real slugs and "product-{mongoId}" format



    if (slug.startsWith('product-')) {



      // Extract real MongoDB _id from "product-{id}" format



      const productId = slug.replace('product-', '');



      console.log('🔍 Slug type: id-slug, extracting MongoDB ID:', productId);



      



      // Query by actual MongoDB _id



      const products = await storage.getProducts();



      product = products.find(p => p.id === productId || p._id?.toString() === productId);



      console.log('📦 Found by ID:', productId, product ? product.name : 'Not found');



      



    } else {



      // Normal slug lookup



      console.log('� Slug type: real-slug, querying by slug:', slug);



      product = await storage.getProductBySlug(slug);



      console.log('📦 Found by slug:', slug, product ? product.name : 'Not found');



    }







    if (!product) {







      console.log('❌ Backend: Product not found for slug:', slug);







      







      // Check if product exists in any user's wishlist







      try {







        const { default: Profile } = await import('./models/Profile');







        const profile = await Profile.findOne({ 







          wishlist: slug 







        });







        







        if (profile) {







          console.log('📦 Product found in wishlist, returning fallback data');







          // Return minimal product data to prevent deletion







          return res.json({







            id: slug,







            name: 'Product no longer available',







            slug: slug,







            price: 0,







            originalPrice: undefined,







            image: '/placeholder-image.jpg',







            category: 'unknown',







            subcategory: undefined,







            rating: 0,







            reviews: 0,







            inStock: false,







            isNew: false,







            description: 'This product is no longer available but is kept in your wishlist for reference.',







            _unavailable: true // Flag to show special UI







          });







        }







      } catch (importError) {







        console.error('❌ Failed to import Profile model:', importError);







      }







      







      return res.status(404).json({ message: "Product not found" });







    }















    console.log('✅ Backend: Sending product data');







    res.json(product);







  });















  // GET product by ID (for wishlist functionality)







  app.get("/api/products/id/:id", async (req, res) => {







    try {







      const productId = req.params.id;







      console.log('🔍 Backend: GET /api/products/id/:id called');







      console.log('📝 Backend: ID parameter:', productId);







      







      // Get all products and find by ID







      const products = await storage.getProducts();







      const product = products.find(p => p.id.toString() === productId);







      







      if (!product) {







        console.log('⚠️ Product not found for ID:', productId);







        return res.status(404).json({ message: "Product not found" });







      }







      







      console.log('✅ Backend: Product found by ID:', product.name);







      res.json(product);







    } catch (error) {







      console.error("Error fetching product by ID:", error);







      res.status(500).json({ message: "Internal server error" });







    }







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







      







      // Get existing product to merge images







      const existingProduct = await storage.getProductById(productId);







      if (!existingProduct) {







        return res.status(404).json({ message: "Product not found" });







      }







      







      // Merge images: use provided images or fall back to existing







      const existingImages = existingProduct.images || (existingProduct.image ? [existingProduct.image] : []);







      const updatedImages = updateData.images || (updateData.image ? [updateData.image] : []);







      







      // If images field provided, use it; otherwise preserve existing







      const mergedImages = updatedImages.length > 0 ? updatedImages : existingImages;







      







      // Update with merged images







      const updateDataWithImages = {







        ...updateData,







        images: mergedImages,







        image: mergedImages[0] || existingProduct.image







      };







      







      // Update product using storage







      const updatedProduct = await storage.updateProduct(productId, updateDataWithImages);







      







      if (!updatedProduct) {







        return res.status(404).json({ message: "Product not found" });







      }







      







      res.json(updatedProduct);







    } catch (error) {







      console.error("Error updating product:", error);







      res.status(500).json({ message: "Internal server error" });







    }







  });















  // DELETE endpoint for products







  app.delete("/api/products/:id", async (req, res) => {







    try {







      const productId = req.params.id;







      







      if (!productId) {







        return res.status(400).json({ message: "Invalid product ID" });







      }







      







      const deleted = await storage.deleteProduct(productId);







      







      if (!deleted) {







        return res.status(404).json({ message: "Product not found" });







      }







      







      res.json({ message: "Product deleted successfully" });







    } catch (error) {







      console.error("Error deleting product:", error);







      res.status(500).json({ message: "Internal server error" });







    }







  });















  // Profile routes







  app.use('/api/profile', profileRoutes);
  app.use('/api/payment', paymentRoutes);















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















  // Address routes - PROTECTED with user isolation















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















  // Profile-specific endpoints (to match client expectations)







  app.get('/api/profile/:userId/wishlist', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







      }















      const wishlist = await userStorage.getWishlist(userId);







      res.json(wishlist);







    } catch (error) {







      console.error('Error fetching wishlist:', error);







      res.status(500).json({ message: 'Failed to fetch wishlist' });







    }







  });















  app.post('/api/profile/:userId/wishlist', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







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















  app.delete('/api/profile/:userId/wishlist/:productId', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId, productId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







      }















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















  app.get('/api/profile/:userId/cart', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







      }















      const cart = await userStorage.getCart(userId);







      res.json(cart);







    } catch (error) {







      console.error('Error fetching cart:', error);







      res.status(500).json({ message: 'Failed to fetch cart' });







    }







  });















  app.post('/api/profile/:userId/cart', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







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















  app.patch('/api/profile/:userId/cart/:productId', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId, productId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







      }















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















  app.delete('/api/profile/:userId/cart/:productId', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId, productId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







      }















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















  app.delete('/api/profile/:userId/cart', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      if (userId !== currentUserId) {







        return res.status(403).json({ message: 'Forbidden' });







      }















      const deletedCount = await userStorage.clearCart(userId);







      res.json({ message: `Cart cleared, removed ${deletedCount} items` });







    } catch (error) {







      console.error('Error clearing cart:', error);







      res.status(500).json({ message: 'Failed to clear cart' });







    }







  });















  // Orders routes - PROTECTED with user isolation







  app.get('/api/orders/:userId', authenticateToken, async (req: any, res: any) => {







    try {







      const { userId } = req.params;







      const currentUserId = req.user?.sub || req.user?.id;







      







      console.log('🔍 Orders API - Requested userId:', userId);







      console.log('🔍 Orders API - Current userId:', currentUserId);







      







      // TEMPORARY: Allow test user to access any orders during development







      if (currentUserId === 'test-user-123') {







        console.log('⚠️ TEMP: Allowing test user to access orders');







      } else if (userId !== currentUserId) {







        console.log('❌ Orders API - Forbidden: User IDs do not match');







        return res.status(403).json({ message: 'Forbidden' });







      }















      const orders = await ordersStorage.getOrders(userId);







      console.log('📦 Orders API - Retrieved orders:', orders.length);







      res.json(orders);







    } catch (error) {







      console.error('Error fetching orders:', error);







      res.status(500).json({ message: 'Failed to fetch orders' });







    }







  });















  app.post('/api/orders', async (req: any, res: any) => {







    try {







      // For development: allow userId in request body for testing







      let userId = req.user?.sub || req.user?.id;







      







      // If no authenticated user but userId in body (for testing)







      if (!userId && req.body.userId) {







        console.log('⚠️ TEMP: Using userId from request body for testing');







        userId = req.body.userId;







      }







      







      if (!userId) {







        return res.status(401).json({ message: 'Unauthorized' });







      }















      const orderData = req.body;







      const newOrder = await ordersStorage.createOrder(userId, orderData);







      res.status(201).json(newOrder);







    } catch (error) {







      console.error('Error creating order:', error);







      res.status(500).json({ message: 'Failed to create order' });







    }







  });















  app.get('/api/admin/orders', async (req: any, res: any) => {

    try {

      console.log('🔍 Admin Orders API - Fetching all orders');

      const orders = await ordersStorage.getAllOrders();

      console.log('📦 Admin Orders API - Retrieved orders:', orders.length);

      res.json(orders);

    } catch (error) {

      console.error('Error fetching admin orders:', error);

      res.status(500).json({ message: 'Failed to fetch orders' });

    }

  });



  // Admin Dashboard API - Returns real analytics data

  app.get('/api/admin/dashboard', async (req: any, res: any) => {

    try {

      console.log('🔍 Admin Dashboard API - Fetching analytics data');

      

      // Get all orders

      const allOrders = await ordersStorage.getAllOrders();

      console.log(`📊 Found ${allOrders.length} orders for analytics`);



      // Calculate total revenue only from orders with completed payment status

      const revenue = allOrders

        .filter((order: any) => order.paymentStatus?.toLowerCase() === 'completed')

        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);



      // Get unique customers

      const uniqueCustomers = new Set(allOrders.map((o: any) => o.userId).filter(Boolean)).size;



      // Get total products

      const allProducts = await storage.getProducts();



      // Get recent orders (last 5) with full details

      const recentOrders = allOrders

        .slice(-5)

        .reverse()

        .map((order: any) => ({

          id: order.id,

          orderNumber: order.orderNumber || `#${order.id.slice(-4).toUpperCase()}`,

          status: order.status || 'pending',

          totalAmount: order.totalAmount || 0,

          createdAt: order.createdAt || new Date().toISOString(),

          items: order.items || [],

          shippingAddress: order.shippingAddress || {},

          paymentMethod: order.paymentMethod || 'Credit Card',

          paymentStatus: order.paymentStatus || 'pending',

          userId: order.userId

        }));



      const dashboardData = {

        summary: {

          totalOrders: allOrders.length,

          totalRevenue: revenue,

          totalCustomers: uniqueCustomers,

          totalProducts: allProducts.length,

          trends: { ordersChange: null, revenueChange: null, customersChange: null, productsChange: null }

        },

        recentOrders,

        topProducts: []

      };



      console.log('✅ Admin Dashboard API - Data prepared');

      res.json(dashboardData);

    } catch (error) {

      console.error('❌ Error fetching admin dashboard:', error);

      res.status(500).json({ message: 'Failed to fetch dashboard data' });

    }

  });



  app.patch('/api/orders/:orderId/status', authenticateToken, async (req: any, res: any) => {

    try {

      const { orderId } = req.params;

      const { status } = req.body;

      

      const updated = await ordersStorage.updateOrderStatus(orderId, status);

      

      if (updated) {

        res.json({ message: 'Order status updated successfully' });

      } else {

        res.status(404).json({ message: 'Order not found' });

      }

    } catch (error) {

      console.error('Error updating order status:', error);

      res.status(500).json({ message: 'Failed to update order status' });

    }

  });



  return httpServer;

}

