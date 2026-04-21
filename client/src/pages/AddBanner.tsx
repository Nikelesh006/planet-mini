import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";

interface Banner {
  _id: string;
  imageUrl: string;
  alt: string;
  order: number;
}

export default function AddBanner() {
  // Existing banners from database
  const [existingBanners, setExistingBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // New images to upload (up to 4 slots)
  const [newImages, setNewImages] = useState<(File | null)[]>([null, null, null, null]);
  const [newPreviews, setNewPreviews] = useState<(string | null)[]>([null, null, null, null]);

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch existing banners on mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners');
      if (response.ok) {
        const result = await response.json();
        // Sort by order
        const sorted = result.data?.sort((a: Banner, b: Banner) => a.order - b.order) || [];
        setExistingBanners(sorted);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    setDeleting(bannerId);
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExistingBanners(prev => prev.filter(b => b._id !== bannerId));
      } else {
        alert('Failed to delete banner');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete banner');
    } finally {
      setDeleting(null);
    }
  };

  const handleNewImageChange = (index: number, file: File | null) => {
    const newImagesArr = [...newImages];
    newImagesArr[index] = file;
    setNewImages(newImagesArr);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviewsArr = [...newPreviews];
        newPreviewsArr[index] = reader.result as string;
        setNewPreviews(newPreviewsArr);
      };
      reader.readAsDataURL(file);
    } else {
      const newPreviewsArr = [...newPreviews];
      newPreviewsArr[index] = null;
      setNewPreviews(newPreviewsArr);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    handleNewImageChange(index, null);
  };

  const handleSubmit = async () => {
    const validImages = newImages.filter(img => img !== null) as File[];
    if (validImages.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      validImages.forEach((img) => {
        formData.append('images', img);
      });

      const response = await fetch('/api/banners', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload banners');
      }

      const result = await response.json();
      alert(`Successfully uploaded ${result.data.length} banner(s)!`);

      // Reset new images and refresh existing banners
      setNewImages([null, null, null, null]);
      setNewPreviews([null, null, null, null]);
      fetchBanners();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload banners");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      key="add-banner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="p-3 text-black hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-black flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              Add Banners
            </h1>
            <p className="text-gray-600 mt-1 text-lg">
              Upload up to 4 banner images for the homepage
            </p>
          </div>
        </div>

        {/* Current Banners Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black">Current Banners</h2>
            <span className="text-gray-500 text-sm">{existingBanners.length} of 4 banners</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : existingBanners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No banners uploaded yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {existingBanners.map((banner, index) => (
                <div
                  key={banner._id}
                  className="relative border-2 border-gray-200 rounded-xl p-4"
                >
                  <div className="relative">
                    <img
                      src={banner.imageUrl}
                      alt={banner.alt}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeleteBanner(banner._id)}
                      disabled={deleting === banner._id}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleting === banner._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Position {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Banners Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black">Add New Banners</h2>
            <span className="text-gray-500 text-sm">
              {newImages.filter(img => img !== null).length} selected
            </span>
          </div>

          <p className="text-gray-600 mb-4 text-sm">
            Select images to add. First image will be Position 1, second will be Position 2, etc.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`relative border-2 ${newPreviews[index] ? 'border-solid border-primary' : 'border-dashed border-gray-300'} rounded-xl p-6 hover:border-primary/50 transition-colors`}
              >
                {newPreviews[index] ? (
                  <div className="relative">
                    <img
                      src={newPreviews[index]!}
                      alt={`New Banner ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      Will be Position {existingBanners.length + index + 1}
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer h-48">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-gray-600 font-medium">Click to upload</span>
                    <span className="text-gray-400 text-sm mt-1">Slot {index + 1}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleNewImageChange(index, e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={uploading || newImages.every(img => img === null)}
              className="bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-2xl font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload New Banners
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>Upload up to 4 banner images</li>
            <li>Recommended size: 1920x600 pixels</li>
            <li>Supported formats: JPG, PNG, WebP</li>
            <li>Maximum file size: 5MB per image</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
