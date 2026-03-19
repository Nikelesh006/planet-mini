import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { Heart, ShoppingBag, Star, Minus, Plus, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLikes } from "@/contexts/LikeContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useProduct } from "@/hooks/useProducts";

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: product, isLoading, error } = useProduct(slug);
  const { addToCart } = useCart();
  const { toggleLike, isLiked } = useLikes();
  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel } = useAuthGuard();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all product images (main image + additional images if available)
  const productImages = [
    product?.image,
    // Add additional images if they exist in the product data
    ...((product as any)?.images || [])
  ].filter(Boolean); // Filter out any null/undefined values

  // Image navigation functions
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (product?.sizes && typeof product.sizes === 'string' && product.sizes.trim() !== '') {
      // String format: "S,M,L,XL"
      const firstSize = product.sizes.split(',')[0]?.trim() || "";
      setSelectedSize(firstSize);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Product Not Found</h1>
          <Link href="/shop/style" className="text-primary hover:underline">
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Execute add to cart with auth guard
    executeWithAuth(() => {
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory || undefined,
      });
      
      // Redirect to cart page after adding
      window.location.href = '/cart';
    });
  };

  const handleWishlist = () => {
    // Toggle like using LikeContext
    toggleLike({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews
    });
  };

  const handleBuyNow = () => {
    // Execute buy now with auth guard
    executeWithAuth(() => {
      // Add to cart first
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory || undefined,
      });
      // Navigate to cart page
      window.location.href = '/cart';
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        {/* Back Button */}
        <Link href="/shop/style" className="inline-flex items-center gap-2 text-black hover:text-primary transition-colors mb-8 font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
        </Link>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl shadow-xl overflow-hidden border border-primary/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="p-8">
              <div className="relative">
                {/* Main Image Container */}
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl overflow-hidden border-2 border-primary/30 relative">
                  <img
                    src={productImages[currentImageIndex] || product?.image}
                    alt={product?.name}
                    className="w-full h-full object-contain p-8" // Changed from object-cover to object-contain with padding
                  />
                  
                  {/* Image Navigation Arrows - Only show if multiple images */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors group"
                      >
                        <ChevronLeft className="w-6 h-6 text-black group-hover:text-primary transition-colors" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors group"
                      >
                        <ChevronRight className="w-6 h-6 text-black group-hover:text-primary transition-colors" />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Indicators - Only show if multiple images */}
                {productImages.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'bg-gradient-to-r from-primary to-secondary w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="p-8 flex flex-col">
              {/* Product Header */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-black mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-black ml-1 font-medium">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                  {product.isNew && (
                    <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-primary to-secondary text-black rounded-full border-2 border-primary">
                      New
                    </span>
                  )}
                </div>
                
                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl font-bold text-black">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed font-medium">{product.description}</p>
              </div>

              {/* Product Options */}
              <div className="space-y-4 mb-6">
                {/* Size Selection */}
                {product.sizes && typeof product.sizes === 'string' && product.sizes.trim() !== '' && (
                  <div className="border-b border-primary/20 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-black">Size</h3>
                      {selectedSize && (
                        <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 text-black rounded-full text-sm font-bold border-2 border-primary/30">
                          {selectedSize}
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-black font-semibold text-base shadow-sm hover:border-primary/40"
                    >
                      <option value="">Select Size</option>
                      {product.sizes.split(',').map((size, index) => (
                        <option key={index} value={size.trim()}>
                          {size.trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 text-black hover:border-primary hover:bg-primary/10 transition-colors font-bold"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center font-bold text-black text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 text-black hover:border-primary hover:bg-primary/10 transition-colors font-bold"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <p className="text-lg font-bold text-green-600">✓ In Stock</p>
                ) : (
                  <p className="text-lg font-bold text-red-600">✗ Out of Stock</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-2xl font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-6 h-6" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 bg-gradient-to-r from-secondary to-primary text-black px-8 py-4 rounded-2xl font-bold hover:from-secondary/90 hover:to-primary/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-6 h-6" />
                  Buy Now
                </button>
                <button
                  onClick={handleWishlist}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-gray-200 text-black hover:border-primary hover:bg-primary/10 transition-colors shadow-md hover:shadow-lg"
                >
                  <Heart 
                    className={`w-6 h-6 transition-colors ${
                      isLiked(product.id) 
                        ? 'fill-current text-red-500' 
                        : 'text-black hover:text-red-500'
                    }`} 
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthCancel}
        initialMode="signin"
      />
    </div>
  );
}
