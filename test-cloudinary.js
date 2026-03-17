import { v2 as cloudinary } from 'cloudinary';

// Test configuration
cloudinary.config({
  cloud_name: 'dgcwiovzd',
  api_key: '737943774844739',
  api_secret: 'rI7p9zXNJppc6hGqJLHgdtiVjiY'
});

// Test authentication
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Cloudinary auth failed:', error);
  } else {
    console.log('Cloudinary auth successful:', result);
  }
});
