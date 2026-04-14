import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";

export default function AddBanner() {
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (index: number, file: File | null) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...previews];
        newPreviews[index] = reader.result as string;
        setPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    } else {
      const newPreviews = [...previews];
      newPreviews[index] = null;
      setPreviews(newPreviews);
    }
  };

  const handleRemoveImage = (index: number) => {
    handleImageChange(index, null);
  };

  const handleSubmit = async () => {
    const validImages = images.filter(img => img !== null) as File[];
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

      // Reset form
      setImages([null, null, null, null]);
      setPreviews([null, null, null, null]);
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

        {/* Image Upload Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-black mb-6">Banner Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                {previews[index] ? (
                  <div className="relative">
                    <img
                      src={previews[index]!}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Banner {index + 1}
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer h-48">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-gray-600 font-medium">Click to upload</span>
                    <span className="text-gray-400 text-sm mt-1">Banner {index + 1}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e.target.files?.[0] || null)}
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
              disabled={uploading}
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
                  Upload Banners
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
