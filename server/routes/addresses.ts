import { Router } from 'express';

import { addressStorage } from '../storage';

import { z } from 'zod';



// Import Address interface from types

import { Address } from '../types/Address';



const router = Router();



// Auth middleware for user isolation

const authenticateToken = (req: any, res: any, next: any) => {

  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  

  // TEMPORARY BYPASS FOR TESTING - Remove in production

  if (!token || token === 'null' || token === 'undefined') {

    console.log('⚠️ TEMP: Using test user for null token in addresses');

    (req as any).user = { 

      sub: 'test-user-123', 

      id: 'test-user-123', 

      email: 'test@example.com' 

    };

    return next();

  }



  // For now, just use the token as user ID (simplified)

  (req as any).user = { 

    sub: token, 

    id: token, 

    email: 'user@example.com' 

  };

  next();

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



export default router;

