import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import { useCloudinary } from "@/hooks/useCloudinary";
import { useProduct, useProductById } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
  Star,
  Check,
  Edit3
} from "lucide-react";

interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  category: "style" | "home";
  subcategory: string;
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew: boolean;
}

export default function AddProduct() {
  const { uploadImages, isUploading, error, clearError } = useCloudinary();
  const search = useSearch();
  
  // Parse edit query parameter from URL
  const searchParams = new URLSearchParams(search);
  const editId = searchParams.get('edit');
  const viewId = searchParams.get('view');
  const isEdit = !!editId;
  const productId = editId || viewId;

  // Fetch product data when in edit or view mode
  const { data: productDataBySlug, isLoading: isLoadingBySlug } = useProduct(productId || '');
  const { data: productDataById, isLoading: isLoadingById } = useProductById(editId || '');
  
  const productData = editId ? productDataById : productDataBySlug;
  const isLoadingProduct = editId ? isLoadingById : isLoadingBySlug;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'style',
    subcategory: '',
    images: [],
    rating: 4.5,
    reviews: 0,
    inStock: true,
    isNew: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  // Reset form to initial empty state
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'style',
      subcategory: '',
      images: [],
      rating: 4.5,
      reviews: 0,
      inStock: true,
      isNew: false
    });
    setErrors({});
    setShowSuccess(false);
  };

  // Pre-fill form when product data is loaded
  useEffect(() => {
    if (productData && (isEdit || viewId)) {
      setFormData({
        id: productData.id?.toString() || '',
        name: productData.name || '',
        slug: productData.slug || '',
        description: productData.description || '',
        price: typeof productData.price === 'number' ? productData.price.toString() : '',
        originalPrice: productData.originalPrice?.toString() || '',
        category: (productData.category as "style" | "home") || 'style',
        subcategory: productData.subcategory || '',
        images: productData.image ? [productData.image] : [],
        rating: productData.rating || 4.5,
        reviews: productData.reviews || 0,
        inStock: productData.inStock ?? true,
        isNew: productData.isNew || false
      });
    }
  }, [productData, isEdit, viewId]);

  const subcategoryOptions = {
    style: [],
    home: ["Shop by Style", "Latest Style Products", "Baby Care Essentials", "Super Saver Offers", "Featured Products"]
  };

  const colorOptions = []; // Remove predefined colors - only use custom colors
  const sizeOptions = ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const imageUrls = await uploadImages(Array.from(files));
        if (imageUrls.length > 0) {
          // Extract URLs from the Cloudinary response objects
          const newImageUrls = imageUrls.map(img => 
            typeof img === 'string' ? img : img.url
          );
          setFormData(prev => ({ 
            ...prev, 
            images: [...prev.images, ...newImageUrls].slice(0, 5) // Limit to 5 images
          }));
          if (errors.images) {
            setErrors(prev => ({ ...prev, images: '' }));
          }
        }
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    // Subcategory is now optional - no validation required
    if (!formData.images || formData.images.length === 0) newErrors.images = 'At least one product image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEdit && editId) {
        // UPDATE existing product
        const response = await fetch(`/api/products/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: formData.slug,
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            category: formData.category,
            subcategory: formData.subcategory,
            image: formData.images[0] || '',
            rating: formData.rating,
            reviews: formData.reviews,
            inStock: formData.inStock,
            isNew: formData.isNew
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update product');
        }
        
        setShowSuccess(true);
        toast({
          title: "Product Updated Successfully!",
          description: "Your product has been updated and is now live on the store.",
          variant: "success"
        });
        
      } else {
        // CREATE NEW (Universal Template Pattern)
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: formData.slug,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            originalPrice: formData.originalPrice || null,
            category: formData.category,
            subcategory: formData.subcategory || null, // Send null if empty
            image: formData.images[0] || '', // Use first image as primary
            rating: formData.rating,
            reviews: formData.reviews,
            inStock: formData.inStock,
            isNew: formData.isNew,
            images: formData.images // Include all images for future use
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create product');
        }
        
        setShowSuccess(true);
        toast({
          title: "Product Added Successfully!",
          description: "Your new product has been added and is now live on the store.",
          variant: "success"
        });
        
        // Reset form to empty state after successful addition
        resetForm();
        
      }
      
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Admin</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          {isEdit ? 'Product updated successfully!' : 'Product created successfully!'}
        </motion.div>
      )}

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8 pointer-events-auto" style={{ pointerEvents: 'auto' }}>
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Product Image
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Show 5 image slots */}
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="relative">
                    {formData.images[index] ? (
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
                        <img
                          src={formData.images[index]}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(e);
                              e.target.value = ''; // Reset input
                            }
                          }}
                          disabled={isUploading || formData.images.length >= 5}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label htmlFor={`image-upload-${index}`} className="cursor-pointer flex flex-col items-center">
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-600 text-center">
                            {formData.images.length >= 5 ? 'Max 5 images' : 'Upload Image'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {errors.images && (
                <p className="text-red-500 text-sm">{errors.images}</p>
              )}
              
              <div className="text-sm text-gray-500">
                {formData.images.length}/5 images uploaded. Add up to 5 product images.
              </div>
            </div>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={false}
                  readOnly={false}
                  autoComplete="off"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pointer-events-auto ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  disabled={false}
                  readOnly={false}
                  autoComplete="off"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pointer-events-auto ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="product-slug"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={false}
                  readOnly={false}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pointer-events-auto ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your product..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={false}
                    readOnly={false}
                    step="0.01"
                    min="0"
                    autoComplete="off"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pointer-events-auto ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹) <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Product Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="style">Shop by Style</option>
                  <option value="home">Home</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${
                    errors.subcategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!formData.category}
                >
                  {formData.category === 'style' ? (
                    <option value="">No categories</option>
                  ) : (
                    <>
                      <option value="">Select subcategory</option>
                      {subcategoryOptions[formData.category]?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </>
                  )}
                </select>
                {errors.subcategory && (
                  <p className="text-red-500 text-sm mt-1">{errors.subcategory}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="inStock"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                  In Stock
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isNew"
                  id="isNew"
                  checked={formData.isNew}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isNew" className="text-sm font-medium text-gray-700">
                  Mark as New
                </label>
              </div>
            </div>
          </motion.div>

          {/* Advanced Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Advanced Options
            </h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"
          >
            <button
              type="button"
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEdit ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update Product' : 'Save Product'}
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
