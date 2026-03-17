import express from 'express';
import jwt from 'jsonwebtoken';
import Profile from '../models/Profile';

const router = express.Router();

// ✅ MIDDLEWARE: Get current user from JWT cookie (matching server/index.ts)
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
      profile = await Profile.create({
        userId,
        firstName: req.user.name?.split(' ')[0] || 'User',
        lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
        email: req.user.email,
      });
    }
    
    res.json(profile);
  } catch (error) {
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

export default router;
