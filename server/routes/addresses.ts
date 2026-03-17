import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Import Address interface from types
import { Address } from '../types/Address';

const router = Router();

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
router.get('/', async (req, res) => {
  try {
    // Get user ID from auth token (simplified for demo)
    const userId = req.headers.authorization?.replace('Bearer ', '') || 'user123';
    
    // Fetch addresses from database storage
    const addresses = await storage.getAddresses(userId);
    
    console.log(`Fetched ${addresses.length} addresses from database for user ${userId}`);
    
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
router.post('/', async (req, res) => {
  try {
    const validatedData = AddressSchema.parse(req.body);
    
    // Get user ID from auth token
    const userId = req.headers.authorization?.replace('Bearer ', '') || 'user123';
    
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
    await storage.saveAddress(userId, newAddress);
    
    console.log('Address saved to database:', newAddress);
    
    res.status(201).json({
      success: true,
      address: newAddress,
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

export default router;
