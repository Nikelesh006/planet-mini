import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { cloudinary, uploadImage } from '../lib/cloudinary.js';
import { requireAuth, isEmailAdmin } from '../lib/authMiddleware.js';

const router = express.Router();

const ALLOWED_UPLOAD_FOLDERS = ['products', 'profiles', 'banners', 'categories'];

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // Keep under Vercel's 4.5MB function payload limit.
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Prefer this endpoint for production uploads: request a signature here,
// then upload directly from the browser to Cloudinary.
router.post('/signature', requireAuth, (req: Request, res: Response) => {
  const timestamp = Math.round(Date.now() / 1000);
  const isAdmin = isEmailAdmin(req.user?.email);
  const requestedFolder = typeof req.body?.folder === 'string' ? req.body.folder : (isAdmin ? 'products' : 'profiles');

  // Non-admin users are strictly restricted to the 'profiles' folder
  if (!isAdmin && requestedFolder !== 'profiles') {
    return res.status(403).json({ error: 'Administrative privileges required to upload to product or store folders' });
  }

  const folder = ALLOWED_UPLOAD_FOLDERS.includes(requestedFolder) ? requestedFolder : (isAdmin ? 'products' : 'profiles');
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary environment variables are missing' });
  }

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    apiSecret
  );

  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
    timestamp,
    signature,
  });
});

// Upload single image (profiles for regular users, store folders for admin)
router.post('/image', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const isAdmin = isEmailAdmin(req.user?.email);
    const requestedFolder = typeof req.body?.folder === 'string' ? req.body.folder : (isAdmin ? 'products' : 'profiles');
    const folder = (!isAdmin || !ALLOWED_UPLOAD_FOLDERS.includes(requestedFolder)) ? 'profiles' : requestedFolder;

    // Upload to Cloudinary
    const result = await uploadImage(file.buffer, folder);
    
    // Return the uploaded image information
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
});

// Upload multiple images (restricted to admin users)
router.post('/images', requireAuth, upload.array('images', 4), async (req: Request, res: Response) => {
  try {
    const isAdmin = isEmailAdmin(req.user?.email);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Administrative privileges required for bulk product image uploads' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadPromises = files.map((file: Express.Multer.File) => uploadImage(file.buffer, 'products'));
    const results = await Promise.all(uploadPromises);

    // Return the uploaded images information
    res.json({
      success: true,
      data: results.map((result: any) => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes
      }))
    });
  } catch (error: any) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
});

export default router;
