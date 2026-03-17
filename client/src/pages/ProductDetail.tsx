import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { Heart, ShoppingBag, Star, Minus, Plus, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    if (product?.sizes && typeof product.sizes === 'string' && product.sizes.trim() !== '') {
      // String format: "S,M,L,XL"
      const firstSize = product.sizes.split(',')[0]?.trim() || "";
      setSelectedSize(firstSize);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        {/* Back Button */}
        <Link href="/shop/style" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="p-8">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="p-8 flex flex-col">
              {/* Product Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
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
                    <span className="text-sm text-gray-600 ml-1">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                  {product.isNew && (
                    <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                      New
                    </span>
                  )}
                </div>
                
                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Options */}
              <div className="space-y-4 mb-6">
                {/* Size Selection */}
                {product.sizes && typeof product.sizes === 'string' && product.sizes.trim() !== '' && (
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">Size</h3>
                      {selectedSize && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {selectedSize}
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-primary outline-none transition-all bg-white text-gray-900 font-medium text-base shadow-sm hover:border-gray-400"
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
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <p className="text-sm text-green-600 font-medium">✓ In Stock</p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">✗ Out of Stock</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Buy Now
                </button>
                <button
                  onClick={handleWishlist}
                  className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 transition-colors ${
                      isLiked(product.id) 
                        ? 'fill-current text-primary' 
                        : 'text-gray-600 hover:text-primary'
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
