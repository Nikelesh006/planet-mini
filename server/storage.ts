import mongoose from 'mongoose';

import { productsStorage } from './db';



// Create a unified storage object that includes all storage functions

export const storage = {

  ...productsStorage,

  async getAddresses(userId: string) {

    return await addressStorage.getAddresses(userId);

  },

  async saveAddress(userId: string, addressData: any) {

    return await addressStorage.createAddress(userId, addressData);

  }

};



// Create address storage using MongoDB collections

export const addressStorage = {

  async getAddresses(userId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log('❌ Database not connected for getAddresses, returning empty array');

        return [];

      }

      const addresses = await db.collection("addresses").find({ userId }).toArray();

      return addresses.map(address => ({

        ...address,

        id: address._id.toString()

      }));

    } catch (error) {

      console.error('Error fetching addresses:', error);

      return [];

    }

  },



  async createAddress(userId: string, addressData: any) {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log('❌ Database not connected for createAddress, returning mock address');

        // Return mock address for testing

        return {

          _id: `addr${Date.now()}`,

          userId: userId,

          ...addressData,

          isDefault: false,

          createdAt: new Date().toISOString(),

          updatedAt: new Date().toISOString()

        };

      }

      const address = { ...addressData, userId, createdAt: new Date(), updatedAt: new Date() };

      const result = await db.collection("addresses").insertOne(address);

      return { ...address, id: result.insertedId.toString(), _id: result.insertedId.toString() };

    } catch (error) {

      console.error('Error creating address:', error);

      // Return mock address even on error for testing

      return {

        _id: `addr${Date.now()}`,

        userId: userId,

        ...addressData,

        isDefault: false,

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString()

      };

    }

  },



  async updateAddress(userId: string, addressId: string, updateData: any) {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log('❌ Database not connected for updateAddress');

        return null;

      }

      const { ObjectId } = mongoose.Types;

      

      const result = await db.collection("addresses").updateOne(

        { _id: new ObjectId(addressId), userId },

        { $set: updateData }

      );

      

      if (result.matchedCount === 0) {

        return null;

      }

      

      const updatedAddress = await db.collection("addresses").findOne({ _id: new ObjectId(addressId) });

      return updatedAddress ? { ...updatedAddress, id: updatedAddress._id.toString() } : null;

    } catch (error) {

      console.error('Error updating address:', error);

      return null;

    }

  },



  async deleteAddress(userId: string, addressId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log('❌ Database not connected for deleteAddress');

        return false;

      }

      const { ObjectId } = mongoose.Types;

      

      const result = await db.collection("addresses").deleteOne({ 

        _id: new ObjectId(addressId), 

        userId 

      });

      

      return result.deletedCount > 0;

    } catch (error) {

      console.error('Error deleting address:', error);

      return false;

    }

  }

};



// Create user storage for cart and wishlist functionality

export const userStorage = {

  // Cart functionality

  async getCart(userId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      const cart = await db.collection("carts").findOne({ userId });

      return cart || { items: [] };

    } catch (error) {

      console.error('Error fetching cart:', error);

      return { items: [] };

    }

  },



  async addToCart(userId: string, itemData: any) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      const cart = await db.collection("carts").findOne({ userId });

      const item = { ...itemData, addedAt: new Date() };

      

      if (cart) {

        // Check if item already exists

        const existingItemIndex = cart.items.findIndex((item: any) => 

          item.productId === itemData.productId && 

          item.size === itemData.size && 

          item.color === itemData.color

        );

        

        if (existingItemIndex >= 0) {

          // Update existing item quantity

          cart.items[existingItemIndex].quantity += itemData.quantity || 1;

        } else {

          // Add new item

          cart.items.push(item);

        }

        

        await db.collection("carts").updateOne(

          { userId },

          { $set: { items: cart.items, updatedAt: new Date() } }

        );

      } else {

        // Create new cart

        await db.collection("carts").insertOne({

          userId,

          items: [item],

          createdAt: new Date(),

          updatedAt: new Date()

        });

      }

      

      return item;

    } catch (error) {

      console.error('Error adding to cart:', error);

      throw error;

    }

  },



  async updateCartItem(userId: string, productId: string, updateData: any) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      const cart = await db.collection("carts").findOne({ userId });

      if (!cart) return false;

      

      const itemIndex = cart.items.findIndex((item: any) => item.productId === productId);

      if (itemIndex === -1) return false;

      

      cart.items[itemIndex] = { ...cart.items[itemIndex], ...updateData };

      

      await db.collection("carts").updateOne(

        { userId },

        { $set: { items: cart.items, updatedAt: new Date() } }

      );

      

      return true;

    } catch (error) {

      console.error('Error updating cart item:', error);

      throw error;

    }

  },



  async removeFromCart(userId: string, productId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      const cart = await db.collection("carts").findOne({ userId });

      if (!cart) return false;

      

      cart.items = cart.items.filter((item: any) => item.productId !== productId);

      

      await db.collection("carts").updateOne(

        { userId },

        { $set: { items: cart.items, updatedAt: new Date() } }

      );

      

      return true;

    } catch (error) {

      console.error('Error removing from cart:', error);

      throw error;

    }

  },



  async clearCart(userId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      const cart = await db.collection("carts").findOne({ userId });

      if (!cart) return 0;

      

      const itemCount = cart.items.length;

      

      await db.collection("carts").updateOne(

        { userId },

        { $set: { items: [], updatedAt: new Date() } }

      );

      

      return itemCount;

    } catch (error) {

      console.error('Error clearing cart:', error);

      throw error;

    }

  },



  // Wishlist functionality

  async getWishlist(userId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      const wishlist = await db.collection("wishlists").findOne({ userId });

      return wishlist || { items: [] };

    } catch (error) {

      console.error('Error fetching wishlist:', error);

      return { items: [] };

    }

  },



  async addToWishlist(userId: string, productId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      const wishlist = await db.collection("wishlists").findOne({ userId });

      const item = { productId, addedAt: new Date() };

      

      if (wishlist) {

        // Check if item already exists

        const exists = wishlist.items.some((item: any) => item.productId === productId);

        if (exists) return null; // Already in wishlist

        

        wishlist.items.push(item);

        await db.collection("wishlists").updateOne(

          { userId },

          { $set: { items: wishlist.items, updatedAt: new Date() } }

        );

      } else {

        // Create new wishlist

        await db.collection("wishlists").insertOne({

          userId,

          items: [item],

          createdAt: new Date(),

          updatedAt: new Date()

        });

      }

      

      return item;

    } catch (error) {

      console.error('Error adding to wishlist:', error);

      throw error;

    }

  },



  async removeFromWishlist(userId: string, productId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      const wishlist = await db.collection("wishlists").findOne({ userId });

      if (!wishlist) return false;

      

      wishlist.items = wishlist.items.filter((item: any) => item.productId !== productId);

      

      await db.collection("wishlists").updateOne(

        { userId },

        { $set: { items: wishlist.items, updatedAt: new Date() } }

      );

      

      return true;

    } catch (error) {

      console.error('Error removing from wishlist:', error);

      throw error;

    }

  },



  async isInWishlist(userId: string, productId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      const wishlist = await db.collection("wishlists").findOne({ userId });

      if (!wishlist) return false;

      

      return wishlist.items.some((item: any) => item.productId === productId);

    } catch (error) {

      console.error('Error checking wishlist:', error);

      return false;

    }

  }

};



// Orders storage functionality

export const ordersStorage = {

  async getOrders(userId: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log('❌ Database not connected for getOrders');

        return [];

      }

      

      console.log(`🔍 Fetching real orders from MongoDB for userId: ${userId}`);

      

      // First, let's see what's in the orders collection

      const allOrders = await db.collection("orders").find({}).toArray();

      console.log(`📊 Total orders in database: ${allOrders.length}`);

      

      if (allOrders.length > 0) {

        console.log('📊 Sample order structure:', JSON.stringify(allOrders[0], null, 2));

        console.log('📊 All userIds in database:', allOrders.map(o => o.userId));

      }

      

      const orders = await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).toArray();

      

      console.log(`📦 Found ${orders.length} real orders in MongoDB for userId: ${userId}`);

      

      if (orders.length === 0) {

        console.log('📦 No real orders found in database, returning empty array');

        return [];

      }

      

      // Convert MongoDB _id to string id and format the data

      const formattedOrders = orders.map(order => {

        console.log('🔍 Raw order data:', JSON.stringify(order, null, 2));

        

        // Transform items to match frontend expectations

        const transformedItems = (order.items || order.products || []).map((item: any) => {

          console.log('🔍 Raw item data:', item);

          

          const transformedItem = {

            id: item.productId || item.id || item._id,

            name: item.name || item.productName,

            price: item.price,

            quantity: item.quantity || 1,

            image: item.image || item.productImage,

            slug: item.slug || item.productSlug || `product-${item.productId || item.id || item._id}`

          };

          

          console.log('🔍 Transformed item:', transformedItem);

          return transformedItem;

        });



        console.log('🔍 Transformed items count:', transformedItems.length);



        const formattedOrder = {

          id: order._id.toString(),

          orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8).toUpperCase()}`,

          status: order.status || 'pending',

          totalAmount: order.total || order.totalAmount || 0,

          createdAt: order.createdAt,

          estimatedDelivery: order.estimatedDelivery,

          trackingNumber: order.trackingNumber,

          items: transformedItems,

          shippingAddress: order.shippingAddress || order.address || {},

          paymentMethod: order.paymentMethod || 'Credit Card',

          paymentStatus: order.paymentStatus || 'paid'

        };

        

        console.log('🔍 Formatted order:', JSON.stringify(formattedOrder, null, 2));

        return formattedOrder;

      });

      

      console.log('📦 Formatted orders:', formattedOrders.length);

      return formattedOrders;

    } catch (error) {

      console.error('Error fetching orders from MongoDB:', error);

      return [];

    }

  },



  getSampleOrders(userId: string) {

    return [

      {

        id: 'sample-order-1',

        orderNumber: 'ORD-SAMPLE-001',

        status: 'delivered',

        totalAmount: 2999,

        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),

        estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),

        trackingNumber: 'TRACK123456789',

        items: [

          {

            id: '1',

            name: 'BMW S1000RR',

            price: 2999,

            quantity: 1,

            image: 'https://res.cloudinary.com/dgcwiovzd/image/upload/v1773758261/products/ad5t0ahllztwzchujnyq.jpg',

            slug: 'bmw-s1000rr'

          }

        ],

        shippingAddress: {

          street: '123 Test Street',

          city: 'New York',

          state: 'NY',

          pincode: '10001'

        },

        paymentMethod: 'Credit Card',

        paymentStatus: 'paid'

      },

      {

        id: 'sample-order-2',

        orderNumber: 'ORD-SAMPLE-002',

        status: 'shipped',

        totalAmount: 1599,

        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),

        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),

        trackingNumber: 'TRACK987654321',

        items: [

          {

            id: '2',

            name: 'Street Triple',

            price: 1599,

            quantity: 1,

            image: 'https://res.cloudinary.com/dgcwiovzd/image/upload/v1773758261/products/ad5t0ahllztwzchujnyq.jpg',

            slug: 'street-triple'

          }

        ],

        shippingAddress: {

          street: '456 Sample Avenue',

          city: 'Los Angeles',

          state: 'CA',

          pincode: '90210'

        },

        paymentMethod: 'PayPal',

        paymentStatus: 'paid'

      }

    ];

  },



  async getAllOrders() {

    try {

      const db = mongoose.connection.db;

      if (!db) {

        console.log('❌ Database not connected for getAllOrders');

        return [];

      }

      

      console.log('🔍 Fetching all orders from MongoDB');

      

      const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();

      

      console.log(`📦 Found ${orders.length} total orders in database`);

      

      if (orders.length === 0) {

        return [];

      }

      

      // Format orders similar to getOrders

      const formattedOrders = orders.map(order => {

        const transformedItems = (order.items || order.products || []).map((item: any) => ({

          id: item.productId || item.id || item._id,

          name: item.name || item.productName,

          price: item.price,

          quantity: item.quantity || 1,

          image: item.image || item.productImage,

          slug: item.slug || item.productSlug || `product-${item.productId || item.id || item._id}`

        }));



        return {

          id: order._id.toString(),

          orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8).toUpperCase()}`,

          status: order.status || 'pending',

          totalAmount: order.total || order.totalAmount || 0,

          createdAt: order.createdAt,

          estimatedDelivery: order.estimatedDelivery,

          trackingNumber: order.trackingNumber,

          items: transformedItems,

          shippingAddress: order.shippingAddress || order.address || {},

          paymentMethod: order.paymentMethod || 'Credit Card',

          paymentStatus: order.paymentStatus || 'paid',

          userId: order.userId

        };

      });

      

      return formattedOrders;

    } catch (error) {

      console.error('Error fetching all orders from MongoDB:', error);

      return [];

    }

  },



  async createOrder(userId: string, orderData: any) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      

      // For testing: if userId is in orderData, use that instead

      const finalUserId = orderData.userId || userId;

      console.log(`🔧 Creating order for userId: ${finalUserId}`);

      

      // Fetch the full shipping address if only ID is provided

      let shippingAddress = orderData.shippingAddress;

      if (!shippingAddress && orderData.shippingAddressId) {

        const { ObjectId } = mongoose.Types;

        try {

          const addressDoc = await db.collection("addresses").findOne({

            _id: new ObjectId(orderData.shippingAddressId),

            userId: finalUserId

          });

          if (addressDoc) {

            shippingAddress = {

              street: addressDoc.street,

              city: addressDoc.city,

              state: addressDoc.state,

              pincode: addressDoc.pincode,

              phone: addressDoc.phone,

              isDefault: addressDoc.isDefault

            };

            console.log('📍 Fetched shipping address:', shippingAddress);

          } else {

            console.log('⚠️ Address not found for ID:', orderData.shippingAddressId);

          }

        } catch (addrError) {

          console.error('Error fetching address:', addrError);

        }

      }

      

      const order = {

        ...orderData,

        userId: finalUserId,

        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,

        status: orderData.status || 'pending',

        paymentStatus: orderData.paymentStatus || 'pending',

        shippingAddress: shippingAddress || orderData.address || null,

        createdAt: new Date(),

        updatedAt: new Date()

      };

      

      // Remove shippingAddressId since we now have the full address

      delete order.shippingAddressId;

      

      console.log('🔧 Order data being saved:', JSON.stringify(order, null, 2));

      

      const result = await db.collection("orders").insertOne(order);

      return { ...order, id: result.insertedId.toString() };

    } catch (error) {

      console.error('Error creating order:', error);

      throw error;

    }

  },



  async updateOrderStatus(orderId: string, status: string) {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      const { ObjectId } = mongoose.Types;

      

      const result = await db.collection("orders").updateOne(

        { _id: new ObjectId(orderId) },

        { $set: { status, updatedAt: new Date() } }

      );

      

      return result.modifiedCount > 0;

    } catch (error) {

      console.error('Error updating order status:', error);

      throw error;

    }

  }

};

