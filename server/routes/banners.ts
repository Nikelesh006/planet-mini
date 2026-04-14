import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import Banner from '../models/Banner.js';
import { uploadImage } from '../lib/cloudinary.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/banners - Get all active banners sorted by order
router.get('/', async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1 });
    res.json({
      success: true,
      data: banners
    });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      error: 'Failed to fetch banners',
      details: error.message
    });
  }
});

// POST /api/banners - Upload multiple banner images
router.post('/', upload.array('images', 4), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    // Get current banner count to set order
    const currentCount = await Banner.countDocuments({ active: true });

    // Upload all images to Cloudinary
    const uploadPromises = files.map((file: Express.Multer.File) => uploadImage(file.buffer));
    const results = await Promise.all(uploadPromises);

    // Create banner documents in database
    const bannerDocs = results.map((result: any, index: number) => ({
      imageUrl: result.secure_url,
      alt: `Banner ${currentCount + index + 1}`,
      order: currentCount + index,
      active: true
    }));

    const savedBanners = await Banner.insertMany(bannerDocs);

    res.json({
      success: true,
      message: `${savedBanners.length} banners uploaded successfully`,
      data: savedBanners
    });
  } catch (error: any) {
    console.error('Banner upload error:', error);
    res.status(500).json({
      error: 'Failed to upload banners',
      details: error.message
    });
  }
});

// DELETE /api/banners/:id - Delete a banner
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      error: 'Failed to delete banner',
      details: error.message
    });
  }
});

// PUT /api/banners/:id - Update banner (alt text, order, active status)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { alt, order, active } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      { alt, order, active },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      error: 'Failed to update banner',
      details: error.message
    });
  }
});

export default router;
