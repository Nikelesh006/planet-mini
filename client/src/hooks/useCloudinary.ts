import { useState } from 'react';
import axios from 'axios';

// Fast compression - optimized for 1-second upload
const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.65): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Skip compression for small files (< 200KB)
    if (file.size < 200 * 1024) {
      resolve(file);
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Aggressive downscaling for speed
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Fast rendering context
        const ctx = canvas.getContext('2d', { 
          alpha: false,
          desynchronized: true 
        });
        
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low'; // Fastest quality
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Fast blob conversion with lower quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file); // Fallback
    };
    reader.onerror = () => resolve(file); // Fallback
  });
};

interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
    size: number;
  }[];
}

interface SingleUploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
    size: number;
  };
}

export const useCloudinary = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Upload multiple images with compression - optimized for speed
  const uploadImages = async (files: File[]): Promise<UploadResponse['data']> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Fast parallel compression - all at once
      const compressionPromises = files.map((file, index) => 
        compressImage(file, 600, 0.65).then(blob => ({ blob, index }))
      );
      
      setUploadProgress(10); // Quick start
      
      const compressedResults = await Promise.all(compressionPromises);
      setUploadProgress(30); // Compression done

      const formData = new FormData();
      
      // Batch append compressed images
      compressedResults.forEach(({ blob, index }) => {
        const compressedFile = new File([blob], files[index].name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        formData.append('images', compressedFile);
      });

      setUploadProgress(40); // Start upload

      const response = await axios.post<UploadResponse>(
        '/api/upload/images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 60) / progressEvent.total)
              : 0;
            setUploadProgress(40 + progress); // 40-100% for upload
          },
          timeout: 30000, // 30 second timeout for faster feedback
        }
      );

      setUploadProgress(100);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.details || err.message || 'Failed to upload images';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 300); // Faster reset
    }
  };

  // Upload single image with compression
  const uploadImage = async (file: File): Promise<SingleUploadResponse['data']> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Fast compression for single image
      setUploadProgress(15);
      const compressedBlob = await compressImage(file, 600, 0.65);
      
      const formData = new FormData();
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      formData.append('image', compressedFile);

      setUploadProgress(40);

      const response = await axios.post<SingleUploadResponse>(
        '/api/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 50) / progressEvent.total)
              : 0;
            setUploadProgress(40 + progress);
          },
          timeout: 60000,
        }
      );

      setUploadProgress(100);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.details || err.message || 'Failed to upload image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  return {
    uploadImages,
    uploadImage,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
};
