import { useState } from 'react';
import axios from 'axios';

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
  const [error, setError] = useState<string | null>(null);

  // Upload multiple images
  const uploadImages = async (files: File[]): Promise<UploadResponse['data']> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Append all files with the same field name
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post<UploadResponse>(
        '/api/upload/images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

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
    }
  };

  // Upload single image
  const uploadImage = async (file: File): Promise<SingleUploadResponse['data']> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post<SingleUploadResponse>(
        '/api/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

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
    }
  };

  return {
    uploadImages,
    uploadImage,
    isUploading,
    error,
    clearError: () => setError(null),
  };
};
