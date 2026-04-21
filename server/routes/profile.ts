import express from 'express';

import jwt from 'jsonwebtoken';

import Profile from '../models/Profile';

const router = express.Router();

// ✅ MIDDLEWARE: Check both cookies and Authorization header
const requireAuth = (req: any, res: any, next: any) => {
  // Check cookie first, then Authorization header
  let token = req.cookies?.jwt;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
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

    

    // Calculate orders stats
    const orders = profile.orders || [];
    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    res.json({
      ...profile.toObject(),
      ordersCount,
      totalSpent
    });

  } catch (error) {

    console.error(' Error fetching profile:', error);

    res.status(500).json({ error: 'Failed to fetch profile' });

  }

});

// 2. POST /api/profile/:userId  useUpdateProfile(userId)

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



// 3. DELETE /api/profile/:userId/baby/:index  ← useDeleteBabyInfo(userId)

router.delete('/:userId/baby/:index', requireAuth, async (req: any, res: any) => {

  try {

    const userId = req.params.userId;
    const index = parseInt(req.params.index);

    

    if (req.user.id !== userId) {

      return res.status(403).json({ error: 'Unauthorized' });

    }

    
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (index < 0 || index >= (profile.babyInfo?.length || 0)) {
      return res.status(400).json({ error: 'Invalid baby index' });
    }

    profile.babyInfo.splice(index, 1);
    await profile.save();

    console.log('✅ Deleted baby at index:', index);

    res.json(profile);

  } catch (error) {

    console.error('❌ Failed to delete baby info:', error);

    res.status(500).json({ error: 'Failed to delete baby info' });

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

    

    // Check if item already exists in cart
    const existingItemIndex = profile.cartItems.findIndex((item: any) => item.id === req.body.id);

    if (existingItemIndex >= 0) {
      // Increment quantity if item exists
      profile.cartItems[existingItemIndex].quantity = (profile.cartItems[existingItemIndex].quantity || 1) + 1;
      console.log('➕ Incremented quantity for existing item:', req.body.id);
    } else {
      // Add new item to cartItems array
      profile.cartItems.push(req.body);
      console.log('✅ Added new item to cart:', req.body.id);
    }

    const updatedProfile = await profile.save();

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

// PATCH /api/profile/:userId/cart/:itemId/increase  ← Increase item quantity
router.patch('/:userId/cart/:itemId/increase', requireAuth, async (req: any, res: any) => {
  console.log('>>> BACKEND: Increase quantity endpoint hit <<<');
  console.log('Params:', req.params);
  console.log('User:', req.user?.id);

  try {
    const { userId, itemId } = req.params;

    if (req.user.id !== userId) {
      console.log('ERROR: User ID mismatch', req.user.id, '!==', userId);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.log('ERROR: Profile not found for user:', userId);
      return res.status(404).json({ error: 'Profile not found' });
    }

    console.log('Current cart items:', profile.cartItems.map((i: any) => ({ id: i.id, name: i.name, qty: i.quantity })));

    // Find and increment quantity
    const cartItem = profile.cartItems.find((item: any) => item.id === itemId);
    if (!cartItem) {
      console.log('ERROR: Item not found in cart. Looking for ID:', itemId);
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    const oldQty = cartItem.quantity || 1;
    cartItem.quantity = oldQty + 1;
    await profile.save();

    console.log('✅ Increased quantity:', itemId, 'from', oldQty, 'to', cartItem.quantity);
    res.json({ success: true, cartItems: profile.cartItems });
  } catch (error) {
    console.error('❌ Failed to increase quantity:', error);
    res.status(500).json({ error: 'Failed to increase quantity' });
  }
  console.log('>>> BACKEND: Increase quantity complete <<<');
});

// PATCH /api/profile/:userId/cart/:itemId/decrease  ← Decrease item quantity (stops at 1)
router.patch('/:userId/cart/:itemId/decrease', requireAuth, async (req: any, res: any) => {
  console.log('>>> BACKEND: Decrease quantity endpoint hit <<<');
  console.log('Params:', req.params);

  try {
    const { userId, itemId } = req.params;

    if (req.user.id !== userId) {
      console.log('ERROR: User ID mismatch');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.log('ERROR: Profile not found for user:', userId);
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Find item
    const cartItem = profile.cartItems.find((item: any) => item.id === itemId);
    if (!cartItem) {
      console.log('ERROR: Item not found in cart. Looking for ID:', itemId);
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    const oldQty = cartItem.quantity || 1;

    // Only decrease if quantity > 1, otherwise keep at 1
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      console.log('✅ Decreased quantity:', itemId, 'from', oldQty, 'to', cartItem.quantity);
    } else {
      console.log('ℹ️ Quantity is 1, not decreasing (minimum reached):', itemId);
    }

    await profile.save();

    res.json({ success: true, cartItems: profile.cartItems });
  } catch (error) {
    console.error('❌ Failed to decrease quantity:', error);
    res.status(500).json({ error: 'Failed to decrease quantity' });
  }
  console.log('>>> BACKEND: Decrease quantity complete <<<');
});

// 7. POST /api/profile/:userId/wishlist  ← Add to wishlist (like button)
router.post('/:userId/wishlist', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    const { productId } = req.body;
    
    const tokenUserId = req.user.sub || req.user.id;
    if (tokenUserId !== userId) {
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

    // Toggle wishlist: add if not present, remove if present
    const isInWishlist = profile.wishlist.includes(productId);
    if (isInWishlist) {
      // Remove from wishlist
      profile.wishlist = profile.wishlist.filter((id: string) => id !== productId);
      console.log('🗑️ Removed from wishlist:', productId);
    } else {
      // Add to wishlist
      profile.wishlist.push(productId);
      console.log('✅ Added to wishlist:', productId);
    }
    await profile.save();

    res.json({ success: true, wishlist: profile.wishlist, action: isInWishlist ? 'removed' : 'added' });
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
    
    const tokenUserId = req.user.sub || req.user.id;
    if (tokenUserId !== userId) {
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

// POST /api/profile/:userId/orders  ← Create new order
router.post('/:userId/orders', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    const { items, total } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Add order to profile
    const newOrder = {
      orderId,
      items,
      total,
      status: 'pending',
      createdAt: new Date()
    };

    profile.orders = profile.orders || [];
    profile.orders.push(newOrder);
    await profile.save();

    console.log('✅ Order created:', orderId, 'Total:', total);

    res.json({ success: true, order: newOrder, orders: profile.orders });
  } catch (error) {
    console.error('❌ Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/profile/:userId/orders  ← Get user orders
router.get('/:userId/orders', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.params.userId;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile.orders || []);
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;

