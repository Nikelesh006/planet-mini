import { Router } from 'express';
import { connectDB } from '../db.js';
import SpinWheelPrize from '../models/SpinWheelPrize.js';
import SpinWheelUser from '../models/SpinWheelUser.js';
import SpinWheelResult from '../models/SpinWheelResult.js';

const router = Router();

// GET /api/spin-wheel/prizes - Get all active prizes
router.get('/prizes', async (req, res) => {
  try {
    await connectDB();
    
    const prizes = await SpinWheelPrize.find({ isActive: true }).sort({ position: 1 });
    
    res.json({
      success: true,
      data: prizes
    });
  } catch (error) {
    console.error('Error fetching prizes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prizes'
    });
  }
});

// POST /api/spin-wheel/user - Create or get user by phone/email
router.post('/user', async (req, res) => {
  try {
    await connectDB();
    
    const { phone, email, termsAccepted, ipAddress, userAgent } = req.body;
    
    if (!phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Phone and email are required'
      });
    }
    
    // Check if user already exists
    let user = await SpinWheelUser.findOne({ phone, email });
    
    if (user) {
      // Update existing user
      if (termsAccepted !== undefined) {
        user.termsAccepted = termsAccepted;
      }
      if (ipAddress) {
        user.ipAddress = ipAddress;
      }
      if (userAgent) {
        user.userAgent = userAgent;
      }
      await user.save();
    } else {
      // Create new user
      user = new SpinWheelUser({
        phone,
        email,
        termsAccepted: termsAccepted || false,
        ipAddress,
        userAgent
      });
      await user.save();
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error creating/fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/fetch user'
    });
  }
});

// POST /api/spin-wheel/spin - Record a spin result
router.post('/spin', async (req, res) => {
  try {
    await connectDB();
    
    const { 
      userId, 
      prizeId, 
      prizeLabel, 
      prizeColor, 
      discountPercentage, 
      discountType, 
      discountValue, 
      isSpinAgain, 
      isNoLuck, 
      wheelPosition, 
      rotationAngle, 
      spinDuration 
    } = req.body;
    
    if (!userId || !prizeId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Prize ID are required'
      });
    }
    
    // Check if user exists
    const user = await SpinWheelUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user has already spun (unless it's a spin again)
    if (user.hasSpun && !isSpinAgain) {
      return res.status(400).json({
        success: false,
        error: 'User has already spun the wheel'
      });
    }
    
    // Create spin result
    const result = new SpinWheelResult({
      userId,
      prizeId,
      prizeLabel,
      prizeColor,
      discountPercentage,
      discountType,
      discountValue,
      isSpinAgain,
      isNoLuck,
      wheelPosition,
      rotationAngle,
      spinDuration
    });
    
    await result.save();
    
    // Update user spin status
    if (!isSpinAgain) {
      user.hasSpun = true;
      user.totalSpins += 1;
      user.lastSpinAt = new Date();
      await user.save();
    } else {
      user.totalSpins += 1;
      await user.save();
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording spin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record spin'
    });
  }
});

// GET /api/spin-wheel/results/:userId - Get spin results for a user
router.get('/results/:userId', async (req, res) => {
  try {
    await connectDB();
    
    const { userId } = req.params;
    
    const results = await SpinWheelResult.find({ userId })
      .sort({ createdAt: -1 })
      .populate('prizeId')
      .populate('userId');
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch results'
    });
  }
});

// POST /api/spin-wheel/claim/:resultId - Claim a prize
router.post('/claim/:resultId', async (req, res) => {
  try {
    await connectDB();
    
    const { resultId } = req.params;
    
    const result = await SpinWheelResult.findById(resultId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }
    
    if (result.claimed) {
      return res.status(400).json({
        success: false,
        error: 'Prize already claimed'
      });
    }
    
    if (result.isNoLuck || result.isSpinAgain) {
      return res.status(400).json({
        success: false,
        error: 'Cannot claim this prize'
      });
    }
    
    result.claimed = true;
    result.claimedAt = new Date();
    await result.save();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error claiming prize:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim prize'
    });
  }
});

// GET /api/spin-wheel/user/:phone/:email - Get user by phone and email
router.get('/user/:phone/:email', async (req, res) => {
  try {
    await connectDB();
    
    const { phone, email } = req.params;
    
    const user = await SpinWheelUser.findOne({ phone, email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// GET /api/spin-wheel/admin/results - Get all spin wheel results for admin
router.get('/admin/results', async (req, res) => {
  try {
    await connectDB();
    
    const results = await SpinWheelResult.find()
      .sort({ createdAt: -1 })
      .populate('userId')
      .populate('prizeId');
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching all results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all results'
    });
  }
});

export default router;
