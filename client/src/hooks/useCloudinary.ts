import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';

// Preserve enough source detail for large product pages and hover zoom.
const compressImage = (file: File, maxWidth: number = 1800, quality: number = 0.92): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Skip compression for small files (< 500KB)
    if (file.size < 500 * 1024) {
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
        
        // Keep a high-resolution source so product detail images do not pixelate.
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
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        
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

  // Upload multiple images with quality-preserving compression
  const uploadImages = async (files: File[]): Promise<UploadResponse['data']> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Parallel compression with enough resolution for product detail views
      const compressionPromises = files.map((file, index) => 
        compressImage(file, 1800, 0.92).then(blob => ({ blob, index }))
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

      const token = localStorage.getItem('jwtToken');
      const response = await axios.post<UploadResponse>(
        `${API_BASE_URL}/api/upload/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 60) / progressEvent.total)
              : 0;
            setUploadProgress(40 + progress); // 40-100% for upload
          },
          timeout: 120000, // Cloudinary can take longer on slower networks or large product photos.
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
      // Quality-preserving compression for single image
      setUploadProgress(15);
      const compressedBlob = await compressImage(file, 1800, 0.92);
      
      const formData = new FormData();
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      formData.append('image', compressedFile);

      setUploadProgress(40);

      const token = localStorage.getItem('jwtToken');
      const response = await axios.post<SingleUploadResponse>(
        `${API_BASE_URL}/api/upload/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
