import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Simple profile schema for testing
const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  babyInfo: [{
    name: String,
    age: Number,
    gender: String
  }],
  wishlist: [String],
  joined: String,
  location: String
}, { timestamps: true });

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

// Get profile by userId
router.get('/:userId', async (req, res) => {
  try {
    console.log('Fetching profile for userId:', req.params.userId);
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, returning demo data');
      return res.json({
        _id: 'demo-id',
        userId: req.params.userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Baby Street',
          city: 'New York',
          state: 'NY',
          pincode: '10001'
        },
        babyInfo: [],
                wishlist: [],
        joined: 'October 2023',
        location: 'New York, USA',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    const profile = await Profile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      console.log('Profile not found, creating demo profile');
      // Create demo profile
      const demoProfile = new Profile({
        userId: req.params.userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Baby Street',
          city: 'New York',
          state: 'NY',
          pincode: '10001'
        },
        babyInfo: [],
                wishlist: [],
        joined: 'October 2023',
        location: 'New York, USA'
      });
      
      await demoProfile.save();
      return res.json(demoProfile);
    }
    
    console.log('Profile found:', profile);
    res.json(profile);
    
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// Create or update profile
router.post('/:userId', async (req, res) => {
  try {
    console.log('Updating profile for userId:', req.params.userId);
    console.log('Request body:', req.body);
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, returning mock success');
      return res.json({
        ...req.body,
        userId: req.params.userId,
        updatedAt: new Date()
      });
    }
    
    const { firstName, lastName, email, phone, address, babyInfo } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      { firstName, lastName, email, phone, address, babyInfo },
      { new: true, upsert: true }
    );
    
    console.log('Profile updated:', profile);
    res.json(profile);
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to save profile', details: error.message });
  }
});

export default router;
