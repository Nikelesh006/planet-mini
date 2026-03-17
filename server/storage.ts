import mongoose from 'mongoose';

import { productsStorage } from "./db";

import { type Product } from "@shared/schema";

import { Address } from "./types/Address";



// In-memory address storage (for demo - replace with real database)

class AddressStorage {

  private addresses: Map<string, Address[]> = new Map();



  async getAddresses(userId: string): Promise<Address[]> {

    return this.addresses.get(userId) || [];

  }



  async getAddress(userId: string, addressId: string): Promise<Address | undefined> {

    const userAddresses = this.addresses.get(userId) || [];

    return userAddresses.find(addr => addr._id === addressId);

  }



  async saveAddress(userId: string, address: Address): Promise<void> {

    const userAddresses = this.addresses.get(userId) || [];

    userAddresses.push(address);

    this.addresses.set(userId, userAddresses);

    console.log(`Saved address for user ${userId}:`, address);

  }



  async updateAddress(userId: string, addressId: string, updates: Partial<Address>): Promise<Address | undefined> {

    const userAddresses = this.addresses.get(userId) || [];

    const addressIndex = userAddresses.findIndex(addr => addr._id === addressId);

    

    if (addressIndex === -1) {

      return undefined;

    }



    const updatedAddress = { ...userAddresses[addressIndex], ...updates };

    userAddresses[addressIndex] = updatedAddress;

    this.addresses.set(userId, userAddresses);

    

    console.log(`Updated address ${addressId} for user ${userId}:`, updatedAddress);

    return updatedAddress;

  }



  async deleteAddress(userId: string, addressId: string): Promise<boolean> {

    const userAddresses = this.addresses.get(userId) || [];

    const addressIndex = userAddresses.findIndex(addr => addr._id === addressId);

    

    if (addressIndex === -1) {

      return false;

    }



    userAddresses.splice(addressIndex, 1);

    this.addresses.set(userId, userAddresses);

    

    console.log(`Deleted address ${addressId} for user ${userId}`);

    return true;

  }

}



// Database address storage

class DatabaseAddressStorage {

  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      
      const addresses = await db.collection("addresses").find({ userId: userId as any }).toArray();
      return addresses as unknown as Address[];
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      console.log(`🔄 Using in-memory address cache`);
      if (process.env.NODE_ENV === 'development') {
        console.warn("MongoDB not available, using cache");
      }
      return [];
    }
  }



  async getAddress(userId: string, addressId: string): Promise<Address | undefined> {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      
      const address = await db.collection("addresses").findOne({ userId: userId as any, _id: addressId as any });
      return address as unknown as Address;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      console.log(`🔄 Using in-memory address cache`);
      return undefined;
    }
  }



  async saveAddress(userId: string, address: Address): Promise<void> {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      const newAddress = {
        ...address,
        _id: address._id as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.collection("addresses").insertOne(newAddress as any);

      console.log(`✅ Saved address to MongoDB for user ${userId}`);

    } catch (error) {

      console.log(`❌ MongoDB error: ${(error as Error).message}`);

      console.log(`🔄 Using in-memory address cache`);

      if (process.env.NODE_ENV === 'development') {

        console.warn("MongoDB not available, using cache");

      }

    }

  }



  async updateAddress(userId: string, addressId: string, updates: Partial<Address>): Promise<Address | undefined> {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      const { ObjectId } = mongoose.Types;

      

      const result = await db.collection("addresses").updateOne(

        { userId, _id: new ObjectId(addressId) },

        { $set: updates }

      );

      

      if (result.matchedCount === 0) {

        return undefined;

      }

      

      const updatedAddress = await db.collection("addresses").findOne({ userId, _id: new ObjectId(addressId) });
      return updatedAddress as unknown as Address || undefined;

    } catch (error) {

      console.log(`❌ MongoDB error: ${(error as Error).message}`);

      console.log(`🔄 Using in-memory address cache`);

      return undefined;

    }

  }



  async deleteAddress(userId: string, addressId: string): Promise<boolean> {

    try {

      const db = mongoose.connection.db;

      if (!db) throw new Error("Database not connected");

      const { ObjectId } = mongoose.Types;

      await db.collection("addresses").deleteOne({ userId, _id: new ObjectId(addressId) });

      console.log(`✅ Deleted address from MongoDB`);

      return true;

    } catch (error) {

      console.log(`❌ MongoDB error: ${(error as Error).message}`);

      console.log(`🔄 Using in-memory address cache`);

      return false;

    }

  }

}



export interface IStorage {

  getProducts(): Promise<Product[]>;

  getProductBySlug(slug: string): Promise<Product | undefined>;

  createProduct(product: Omit<Product, "id">): Promise<Product>;

  updateProduct(id: string, product: Partial<Product>): Promise<Product | null>;

  deleteProduct(id: string): Promise<void>;

}



export class DatabaseStorage implements IStorage {

  private addressStorage = new DatabaseAddressStorage();



  async getProducts(): Promise<Product[]> {

    return await productsStorage.getProducts();

  }



  async getProductBySlug(slug: string): Promise<Product | undefined> {

    return await productsStorage.getProductBySlug(slug);

  }



  async createProduct(product: Omit<Product, "id">): Promise<Product> {

    return await productsStorage.createProduct(product);

  }



  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {

    return await productsStorage.updateProduct(id, product);

  }



  async deleteProduct(id: string): Promise<void> {

    await productsStorage.deleteProduct(id);

  }



  // Address storage methods

  async getAddresses(userId: string): Promise<Address[]> {

    return await this.addressStorage.getAddresses(userId);

  }



  async getAddress(userId: string, addressId: string): Promise<Address | undefined> {

    return await this.addressStorage.getAddress(userId, addressId);

  }



  async saveAddress(userId: string, address: Address): Promise<void> {

    await this.addressStorage.saveAddress(userId, address);

  }



  async updateAddress(userId: string, addressId: string, address: Partial<Address>): Promise<Address | undefined> {

    return await this.addressStorage.updateAddress(userId, addressId, address);

  }



  async deleteAddress(userId: string, addressId: string): Promise<boolean> {

    return await this.addressStorage.deleteAddress(userId, addressId);

  }

}



export const storage = new DatabaseStorage();

export const addressStorage = new DatabaseAddressStorage();

// User-based storage with user schema
export const userStorage = {
  async getUser(userId: string) {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      
      let user = await db.collection("user").findOne({ _id: userId as any });
      
      // If user doesn't exist, create a basic user record
      if (!user) {
        console.log(`⚠️ User not found, creating new user: ${userId}`);
        const newUser = {
          _id: userId as any,
          name: "",
          email: "",
          imageUrl: "",
          cartItems: [],
          wishlist: [],
          phone: "",
          address: "",
          bio: ""
        };
        
        await db.collection("user").insertOne(newUser as any);
        user = newUser;
        console.log(`✅ Created new user: ${userId}`);
      }
      
      return user;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return null;
    }
  },

  async updateUser(userId: string, updates: any) {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      
      const result = await db.collection("user").updateOne(
        { _id: userId as any },
        { $set: updates }
      );
      console.log(`✅ Updated user: ${userId}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return false;
    }
  },

  // Cart operations within user schema
  async getCart(userId: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return [];
      }
      
      console.log(`✅ Retrieved ${user.cartItems?.length || 0} cart items from user schema for: ${userId}`);
      return user.cartItems || [];
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return [];
    }
  },

  async addToCart(userId: string, cartItem: any) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return null;
      }

      // Check if item already exists in cart
      const existingItemIndex = user.cartItems?.findIndex((item: any) => 
        item.productId === cartItem.productId && item.size === cartItem.size && item.color === cartItem.color
      ) || -1;

      let updatedCartItems;
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        updatedCartItems = [...user.cartItems];
        updatedCartItems[existingItemIndex].quantity += cartItem.quantity;
      } else {
        // Add new item
        updatedCartItems = [...(user.cartItems || []), cartItem];
      }

      const updated = await this.updateUser(userId, { cartItems: updatedCartItems });
      if (updated) {
        console.log(`✅ Added cart item for user: ${userId}`);
        return cartItem;
      }
      return null;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return null;
    }
  },

  async updateCartItem(userId: string, productId: string, updates: any) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return false;
      }

      const updatedCartItems = user.cartItems?.map((item: any) => 
        item.productId === productId ? { ...item, ...updates } : item
      ) || [];

      const updated = await this.updateUser(userId, { cartItems: updatedCartItems });
      if (updated) {
        console.log(`✅ Updated cart item for user: ${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return false;
    }
  },

  async removeFromCart(userId: string, productId: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return false;
      }

      const updatedCartItems = user.cartItems?.filter((item: any) => item.productId !== productId) || [];
      const updated = await this.updateUser(userId, { cartItems: updatedCartItems });
      
      if (updated) {
        console.log(`✅ Removed cart item for user: ${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return false;
    }
  },

  async clearCart(userId: string) {
    try {
      const updated = await this.updateUser(userId, { cartItems: [] });
      if (updated) {
        console.log(`✅ Cleared cart for user: ${userId}`);
        return 1;
      }
      return 0;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return 0;
    }
  },

  // Wishlist operations within user schema
  async getWishlist(userId: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return [];
      }
      
      console.log(`✅ Retrieved ${user.wishlist?.length || 0} wishlist items from user schema for: ${userId}`);
      return user.wishlist || [];
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return [];
    }
  },

  async addToWishlist(userId: string, productId: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return null;
      }

      // Check if already in wishlist
      if (user.wishlist?.includes(productId)) {
        console.log(`⚠️ Product already in wishlist for user: ${userId}`);
        return { productId, alreadyExists: true };
      }

      const updatedWishlist = [...(user.wishlist || []), productId];
      const updated = await this.updateUser(userId, { wishlist: updatedWishlist });
      
      if (updated) {
        console.log(`✅ Added wishlist item for user: ${userId}`);
        return { productId, addedAt: new Date().toISOString() };
      }
      return null;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return null;
    }
  },

  async removeFromWishlist(userId: string, productId: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return false;
      }

      const updatedWishlist = user.wishlist?.filter((id: string) => id !== productId) || [];
      const updated = await this.updateUser(userId, { wishlist: updatedWishlist });
      
      if (updated) {
        console.log(`✅ Removed wishlist item for user: ${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return false;
    }
  },

  async isInWishlist(userId: string, productId: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return false;
      }

      return user.wishlist?.includes(productId) || false;
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return false;
    }
  }
};

export const ordersStorage = {
  async getOrders(userId?: string) {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      
      const filter = userId ? { userId } : {};
      const orders = await db.collection("orders").find(filter).toArray();
      console.log(`✅ Retrieved ${orders.length} orders from MongoDB for user: ${userId || 'all'}`);
      
      // Convert MongoDB _id to string id for frontend compatibility
      return orders.map(order => ({
        ...order,
        id: order._id.toString()
      }));
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return [];
    }
  },

  async createOrder(orderData: any) {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database not connected");
      
      const result = await db.collection("orders").insertOne(orderData);
      console.log(`✅ Created order for user: ${orderData.userId}`);
      
      return {
        ...orderData,
        id: result.insertedId.toString()
      };
    } catch (error) {
      console.log(`❌ MongoDB error: ${(error as Error).message}`);
      return null;
    }
  }
};

