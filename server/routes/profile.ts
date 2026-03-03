import express from 'express';
import Profile from '../models/Profile';

const router = express.Router();

// Get profile by userId
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate('wishlist');
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update profile
router.post('/:userId', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, babyInfo } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      { firstName, lastName, email, phone, address, babyInfo },
      { new: true, upsert: true }
    ).populate('wishlist');
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Update wishlist
router.post('/:userId/wishlist', async (req, res) => {
  try {
    const { productId } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

// Remove from wishlist
router.delete('/:userId/wishlist/:productId', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { wishlist: req.params.productId } },
      { new: true }
    ).populate('wishlist');
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Add baby info
router.post('/:userId/baby', async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      { $push: { babyInfo: { name, age, gender } } },
      { new: true }
    );
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add baby info' });
  }
});

// Update baby info
router.put('/:userId/baby/:babyId', async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId, 'babyInfo._id': req.params.babyId },
      { $set: { 'babyInfo.$': { name, age, gender } } },
      { new: true }
    );
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update baby info' });
  }
});

// Delete baby info
router.delete('/:userId/baby/:babyId', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { babyInfo: { _id: req.params.babyId } } },
      { new: true }
    );
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete baby info' });
  }
});

export default router;
