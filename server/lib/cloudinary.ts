import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug: Log configuration (remove in production)
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'undefined',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'undefined'
});

export { cloudinary };

// Upload image to Cloudinary
export const uploadImage = async (file: Buffer, folder: string = 'products'): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        max_file_size: 5000000, // 5MB
        transformation: [
          {
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error details:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name
          });
          reject(error);
        } else if (result) {
          console.log('Cloudinary upload success:', result.public_id);
          resolve(result);
        } else {
          reject(new Error('No result from Cloudinary'));
        }
      }
    ).end(file);
  });
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Get image URL with transformations
export const getImageUrl = (publicId: string, options?: any): string => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
};
