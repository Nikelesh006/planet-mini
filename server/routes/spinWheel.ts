import { Router } from 'express';
import { connectDB } from '../db.js';
import SpinWheelPrize from '../models/SpinWheelPrize.js';
import SpinWheelUser from '../models/SpinWheelUser.js';
import SpinWheelResult from '../models/SpinWheelResult.js';
import { requireAdmin } from '../lib/authMiddleware.js';

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

    const cleanPhone = String(phone).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const clientIp = ipAddress || req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientUserAgent = userAgent || req.headers['user-agent'];
    
    // Check if user already exists with matching phone OR email
    let user = await SpinWheelUser.findOne({
      $or: [{ phone: cleanPhone }, { email: cleanEmail }]
    });
    
    if (user) {
      // Update existing user details
      if (termsAccepted !== undefined) {
        user.termsAccepted = termsAccepted;
      }
      user.phone = cleanPhone;
      user.email = cleanEmail;
      if (clientIp) {
        user.ipAddress = String(clientIp);
      }
      if (clientUserAgent) {
        user.userAgent = String(clientUserAgent);
      }
      await user.save();
    } else {
      // Create new user
      user = new SpinWheelUser({
        phone: cleanPhone,
        email: cleanEmail,
        termsAccepted: termsAccepted || false,
        ipAddress: clientIp ? String(clientIp) : null,
        userAgent: clientUserAgent ? String(clientUserAgent) : null
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
      spinDuration,
      phone,
      email
    } = req.body;
    
    // Find user by userId or phone/email fallback
    let user = null;
    if (userId) {
      try {
        user = await SpinWheelUser.findById(userId);
      } catch (e) {
        // userId may not be a valid ObjectId format
      }
    }
    if (!user && (phone || email)) {
      user = await SpinWheelUser.findOne({
        $or: [
          ...(phone ? [{ phone: String(phone).trim() }] : []),
          ...(email ? [{ email: String(email).trim().toLowerCase() }] : [])
        ]
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please register first.'
      });
    }
    
    // Check if user has already spun (unless it's a spin again)
    if (user.hasSpun && !isSpinAgain) {
      return res.status(400).json({
        success: false,
        error: 'User has already spun the wheel'
      });
    }
    
    // Find prize by prizeId, wheelPosition, or prizeLabel fallback
    let prize = null;
    if (prizeId) {
      try {
        prize = await SpinWheelPrize.findById(prizeId);
      } catch (e) {
        // prizeId may not be a valid ObjectId format
      }
    }
    if (!prize && wheelPosition !== undefined && wheelPosition !== null) {
      prize = await SpinWheelPrize.findOne({ position: Number(wheelPosition), isActive: true });
    }
    if (!prize && prizeLabel) {
      prize = await SpinWheelPrize.findOne({ label: prizeLabel, isActive: true });
    }

    if (!prize) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive prize selected'
      });
    }

    const finalIsSpinAgain = Boolean(prize.isSpinAgain ?? isSpinAgain);
    const finalIsNoLuck = Boolean(prize.isNoLuck ?? isNoLuck);

    // Create spin result using authoritative values from the database
    const result = new SpinWheelResult({
      userId: user._id,
      prizeId: prize._id,
      prizeLabel: prize.label || prizeLabel,
      prizeColor: prize.color || prizeColor,
      discountPercentage: prize.discountPercentage ?? discountPercentage ?? null,
      discountType: prize.discountType ?? discountType ?? 'none',
      discountValue: prize.discountValue ?? discountValue ?? null,
      isSpinAgain: finalIsSpinAgain,
      isNoLuck: finalIsNoLuck,
      wheelPosition: wheelPosition !== undefined && wheelPosition !== null ? Number(wheelPosition) : prize.position,
      rotationAngle: rotationAngle ?? 0,
      spinDuration: spinDuration ?? 6000
    });

    await result.save();
    
    // Update user spin status
    if (!finalIsSpinAgain) {
      user.hasSpun = true;
      user.totalSpins = (user.totalSpins || 0) + 1;
      user.lastSpinAt = new Date();
      await user.save();
    } else {
      user.totalSpins = (user.totalSpins || 0) + 1;
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
router.get('/admin/results', requireAdmin, async (req, res) => {
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
