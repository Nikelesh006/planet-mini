import express from 'express';

import jwt from 'jsonwebtoken';

import Profile from '../models/Profile';

const router = express.Router();

// ✅ MIDDLEWARE: Use same JWT extraction as auth/session route
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('jwt');
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. GET /api/profile/:userId  ← useProfile(userId)

router.get('/:userId', requireAuth, async (req: any, res: any) => {

  try {

    const userId = req.params.userId;

    

    // Security: only allow own profile

    if (req.user.id !== userId) {

      return res.status(403).json({ error: 'Unauthorized' });

    }

    

    let profile = await Profile.findOne({ userId });

    

    // Auto-create if missing (your 27min requirement)

    if (!profile) {

      try {
        profile = await Profile.create({

          userId,

          firstName: req.user.name?.split(' ')[0] || 'User',

          lastName: req.user.name?.split(' ').slice(1).join(' ') || '',

          email: req.user.email,

          wishlist: [],
          cartItems: []

        });
      } catch (createError: any) {
        // Handle duplicate key error by finding existing profile
        if (createError.code === 11000) {
          profile = await Profile.findOne({ userId });
          if (!profile) {
            // If still not found, drop problematic index and retry
            try {
              await Profile.collection.dropIndex('orders.orderId_1');
              console.log('✅ Dropped problematic index orders.orderId_1');
            } catch (indexError: any) {
              console.log('ℹ️ Index drop failed:', indexError?.message || indexError);
            }
            
            profile = await Profile.create({
              userId,
              firstName: req.user.name?.split(' ')[0] || 'User',
              lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
              email: req.user.email,
              wishlist: [],
              cartItems: []
            });
          }
        } else {
          throw createError;
        }
      }
    }

    

    res.json(profile);

  } catch (error) {

    console.error('❌ Profile GET - Error:', error);

    res.status(500).json({ error: 'Failed to fetch profile' });

  }

});



// 2. POST /api/profile/:userId  ← useUpdateProfile(userId)

router.post('/:userId', requireAuth, async (req: any, res: any) => {

  try {

    const userId = req.params.userId;

    

    console.log('=== PROFILE UPDATE REQUEST START ===');

    console.log('userId:', userId);

    console.log('req.user:', req.user);

    console.log('req.body:', req.body);

    

    if (req.user.id !== userId) {

      return res.status(403).json({ error: 'Unauthorized' });

    }

    

    // First try to find existing profile

    let existingProfile = await Profile.findOne({ userId });

    console.log('Existing profile:', existingProfile);

    

    if (!existingProfile) {

      // Create new profile if doesn't exist

      existingProfile = new Profile({

        userId,

        firstName: req.body.firstName,

        lastName: req.body.lastName,

        email: req.body.email,

        phone: req.body.phone,

        address: req.body.address,

        updatedAt: new Date()

      });

      await existingProfile.save();

      console.log('Created new profile:', existingProfile);

    } else {

      // Update existing profile

      existingProfile.firstName = req.body.firstName;

      existingProfile.lastName = req.body.lastName;

      existingProfile.email = req.body.email;

      existingProfile.phone = req.body.phone;

      existingProfile.address = req.body.address;

      existingProfile.updatedAt = new Date();

      

      await existingProfile.save();

      console.log('Updated existing profile:', existingProfile);

    }

    

    res.json(existingProfile);

  } catch (error: any) {

    console.error('=== PROFILE UPDATE ERROR ===');

    console.error('Profile update error:', error);

    console.error('Error stack:', error.stack);

    res.status(500).json({ error: 'Failed to update profile', details: error.message });

  }

});



// 3. POST /api/profile/:userId/baby  ← useAddBabyInfo(userId)

router.post('/:userId/baby', requireAuth, async (req: any, res: any) => {

  try {

    const userId = req.params.userId;

    

    if (req.user.id !== userId) {

      return res.status(403).json({ error: 'Unauthorized' });

    }

    

    const profile = await Profile.findOneAndUpdate(

      { userId },

      { $push: { babyInfo: req.body } },  // { name, age, gender }

      { returnDocument: 'after' }

    );

    

    res.json(profile);

  } catch (error) {

    res.status(500).json({ error: 'Failed to add baby info' });

  }

});



// 4. POST /api/profile/:userId/cart  ← Add item to cart

router.post('/:userId/cart', requireAuth, async (req: any, res: any) => {

  try {

    const userId = req.params.userId;

    

    if (req.user.id !== userId) {

      return res.status(403).json({ error: 'Unauthorized' });

    }

    

    let profile = await Profile.findOne({ userId });

    

    // Auto-create profile if not found

    if (!profile) {

      profile = await Profile.create({

        userId,

        firstName: req.user.name?.split(' ')[0] || 'User',

        lastName: req.user.name?.split(' ').slice(1).join(' ') || '',

        email: req.user.email,

        wishlist: [],

        cartItems: [],

      });

      console.log('✅ Auto-created profile for user:', userId);

    }

    

    // Add item to cartItems array

    profile.cartItems.push(req.body);

    const updatedProfile = await profile.save();

    console.log('✅ Added to cart:', updatedProfile.cartItems);

    

    res.json({ success: true, cartItems: updatedProfile.cartItems });

  } catch (error) {

    console.error('❌ Failed to add to cart:', error);

    res.status(500).json({ error: 'Failed to add to cart' });

  }

});



// 5. GET /api/profile/:userId/cart  ← Get cart items

router.get('/:userId/cart', requireAuth, async (req: any, res: any) => {

  try {

    const userId = req.params.userId;

    

    if (req.user.id !== userId) {

      return res.status(403).json({ error: 'Unauthorized' });

    }

    

    let profile = await Profile.findOne({ userId });

    

    // Auto-create profile if not found

    if (!profile) {

      try {
        profile = await Profile.create({

          userId,

          firstName: req.user.name?.split(' ')[0] || 'User',

          lastName: req.user.name?.split(' ').slice(1).join(' ') || '',

          email: req.user.email,

          wishlist: [],

          cartItems: [],

        });
      } catch (createError: any) {
        // Handle duplicate key error by finding existing profile
        if (createError.code === 11000) {
          profile = await Profile.findOne({ userId });
          if (!profile) {
            // If still not found, drop problematic index and retry
            try {
              await Profile.collection.dropIndex('orders.orderId_1');
              console.log('✅ Dropped problematic index orders.orderId_1');
            } catch (indexError: any) {
              console.log('ℹ️ Index drop failed:', indexError?.message || indexError);
            }
            
            profile = await Profile.create({
              userId,
              firstName: req.user.name?.split(' ')[0] || 'User',
              lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
              email: req.user.email,
              wishlist: [],
              cartItems: []
            });
          }
        } else {
          throw createError;
        }
      }

      console.log('✅ Auto-created profile for user:', userId);

    }

    

    res.json(profile.cartItems || []);

  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch cart' });

  }

});



// 6. DELETE /api/profile/:userId/cart/:itemId  ← Remove item from cart

router.delete('/:userId/cart/:itemId', requireAuth, async (req: any, res: any) => {

  try {

    const { userId, itemId } = req.params;

    

    if (req.user.id !== userId) {

      return res.status(403).json({ error: 'Unauthorized' });

    }

    

    const profile = await Profile.findOne({ userId });

    if (!profile) {

      return res.status(404).json({ error: 'Profile not found' });

    }

    
    // Remove item from cartItems array
    profile.cartItems = profile.cartItems.filter((item: any) => item.id !== itemId);
    const updatedProfile = await profile.save();

    console.log('🗑️ Removed from cart:', itemId, 'Updated cart:', updatedProfile.cartItems);

    res.json({ success: true, cartItems: updatedProfile.cartItems });
  } catch (error) {
    console.error('❌ Failed to remove from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// 7. POST /api/profile/:userId/wishlist  ← Add to wishlist (like button)
router.post('/:userId/wishlist', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    const { productId } = req.body;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    let profile = await Profile.findOne({ userId });
    
    // Auto-create profile if not found
    if (!profile) {
      profile = await Profile.create({
        userId,
        firstName: req.user.name?.split(' ')[0] || 'User',
        lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
        email: req.user.email,
        wishlist: [],
        cartItems: [],
      });
      console.log('✅ Auto-created profile for user:', userId);
    }
    
    // Add to wishlist if not already there
    if (!profile.wishlist.includes(productId)) {
      profile.wishlist.push(productId);
      const updatedProfile = await profile.save();
      console.log('✅ Added to wishlist:', updatedProfile.wishlist);
    }
    
    res.json({ success: true, wishlist: profile.wishlist });
  } catch (error) {
    console.error('❌ Failed to add to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// 8. GET /api/profile/:userId/wishlist  ← Get wishlist
router.get('/:userId/wishlist', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    let profile = await Profile.findOne({ userId });
    
    // Auto-create profile if not found
    if (!profile) {
      try {
        profile = await Profile.create({
          userId,
          firstName: req.user.name?.split(' ')[0] || 'User',
          lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
          email: req.user.email,
          wishlist: [],
          cartItems: []
        });
      } catch (createError: any) {
        // Handle duplicate key error by finding existing profile
        if (createError.code === 11000) {
          profile = await Profile.findOne({ userId });
          if (!profile) {
            // If still not found, drop problematic index and retry
            try {
              await Profile.collection.dropIndex('orders.orderId_1');
              console.log('✅ Dropped problematic index orders.orderId_1');
            } catch (indexError: any) {
              console.log('ℹ️ Index drop failed:', indexError?.message || indexError);
            }
            
            profile = await Profile.create({
              userId,
              firstName: req.user.name?.split(' ')[0] || 'User',
              lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
              email: req.user.email,
              wishlist: [],
              cartItems: []
            });
          }
        } else {
          throw createError;
        }
      }
    }
    
    res.json(profile.wishlist || []);
  } catch (error) {
    console.error('❌ Failed to fetch wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// 9. DELETE /api/profile/:userId/wishlist/:productId  ← Remove from wishlist
router.delete('/:userId/wishlist/:productId', requireAuth, async (req: any, res: any) => {
  try {
    const { userId, productId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Use atomic $pull operation to avoid version conflicts
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $pull: { wishlist: productId } },
      { returnDocument: 'after', runValidators: false }
    );
    
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    console.log('🗑️ Removed from wishlist:', productId, 'Updated wishlist:', updatedProfile.wishlist);
    
    res.json({ success: true, wishlist: updatedProfile.wishlist });
  } catch (error) {
    console.error('❌ Failed to remove from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;

