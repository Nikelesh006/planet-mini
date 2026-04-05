import { Router } from 'express';

import { addressStorage } from '../storage';

import { z } from 'zod';

import jwt from 'jsonwebtoken';



// Import Address interface from types

import { Address } from '../types/Address';



const router = Router();



// Auth middleware for user isolation - Same logic as orders
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  console.log('🔐 Address Auth check:', { authHeader, hasToken: !!token, tokenValue: token });
  
  // For development: Check if this is a Google auth session
  if (!token || token === 'null' || token === 'undefined') {
    // Check if there's a session-based auth (Google OAuth)
    const sessionUserId = req.headers['x-user-id'] || req.query.userId;
    if (sessionUserId && sessionUserId !== 'test-user-123') {
      console.log('✅ Using Google session user ID for addresses:', sessionUserId);
      req.user = { 
        sub: sessionUserId, 
        id: sessionUserId, 
        email: req.headers['x-user-email'] || 'user@gmail.com'
      };
      return next();
    }
    
    // Only use test user for explicit testing
    if (sessionUserId === 'test-user-123') {
      console.log('⚠️ TEMP: Using test user for addresses testing');
      req.user = { 
        sub: 'test-user-123', 
        id: 'test-user-123', 
        email: 'test@example.com' 
      };
      return next();
    }
    
    console.log('❌ No authentication found for addresses');
    return res.status(401).json({ 
      error: 'No token provided',
      message: 'Authentication required'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  console.log('🔑 Using JWT secret for addresses:', jwtSecret ? 'Set' : 'Not set');

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      console.log('❌ Address token verification failed:', {
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
    
    console.log('✅ Address token verified successfully:', { 
      userId: user?.sub || user?.id || user?.userId,
      email: user?.email 
    });
    
    req.user = user;
    next();
  });
};



// Address schema validation

const AddressSchema = z.object({

  fullName: z.string().min(1, 'Full name is required'),

  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),

  pincode: z.string().regex(/^\d{6}$/, 'Pin code must be 6 digits'),

  street: z.string().min(1, 'Street address is required'),

  city: z.string().min(1, 'City is required'),

  state: z.string().min(1, 'State is required'),

});



// GET /api/addresses - Get all addresses for current user from database

router.get('/', authenticateToken, async (req, res) => {

  try {

    const userId = (req as any).user?.sub || (req as any).user?.id;

    

    if (!userId) {

      return res.status(401).json({

        success: false,

        message: 'Unauthorized'

      });

    }

    

    console.log(`🔍 Fetching addresses for user: ${userId}`);

    

    // Fetch addresses from database storage

    const addresses = await addressStorage.getAddresses(userId);

    

    console.log(`📦 Fetched ${addresses.length} addresses from database for user ${userId}`);

    

    res.json({

      success: true,

      addresses: addresses

    });

  } catch (error) {

    console.error('Error fetching addresses from database:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to fetch addresses from database'

    });

  }

});



// POST /api/addresses - Create a new address in database

router.post('/', authenticateToken, async (req, res) => {

  try {

    const validatedData = AddressSchema.parse(req.body);

    

    const userId = (req as any).user?.sub || (req as any).user?.id;

    

    if (!userId) {

      return res.status(401).json({

        success: false,

        message: 'Unauthorized'

      });

    }

    

    console.log(`🔍 Creating address for user: ${userId}`, validatedData);

    

    // Create new address with database fields

    const newAddress: Address = {

      _id: `addr${Date.now()}`, // Generate unique ID

      userId: userId,

      ...validatedData,

      isDefault: false,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString()

    };



    // Save to database storage

    const savedAddress = await addressStorage.createAddress(userId, validatedData);

    

    console.log('✅ Address saved to database:', savedAddress);

    

    res.status(201).json({

      success: true,

      address: savedAddress,

      message: 'Address saved to database successfully'

    });

  } catch (error) {

    if (error instanceof z.ZodError) {

      return res.status(400).json({

        success: false,

        message: 'Validation failed',

        errors: error.errors

      });

    }



    console.error('Error creating address in database:', error);

    res.status(500).json({

      success: false,

      message: 'Failed to save address to database'

    });

  }

});

// PUT /api/addresses/:addressId - Update an existing address
router.put('/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const validatedData = AddressSchema.parse(req.body);
    
    const userId = (req as any).user?.sub || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    console.log(`🔍 Updating address ${addressId} for user: ${userId}`, validatedData);
    
    // Update address in database
    const updatedAddress = await addressStorage.updateAddress(userId, addressId, validatedData);
    
    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    console.log('✅ Address updated in database:', updatedAddress);
    
    res.json({
      success: true,
      address: updatedAddress,
      message: 'Address updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Error updating address in database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address'
    });
  }
});

// DELETE /api/addresses/:addressId - Delete an address
router.delete('/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const userId = (req as any).user?.sub || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    console.log(`🔍 Deleting address ${addressId} for user: ${userId}`);
    
    // Delete address from database
    const deleted = await addressStorage.deleteAddress(userId, addressId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    console.log('✅ Address deleted from database');
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address from database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
});

export default router;

