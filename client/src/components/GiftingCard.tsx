import { Link } from "wouter";
import { Heart, ShoppingBag, Star, Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLikes } from "@/contexts/LikeContext";
import { useCart } from "@/contexts/CartContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useToast } from "@/hooks/use-toast";
import type { ProductResponse } from "@shared/routes";

interface GiftingCardProps {
  product: ProductResponse;
  index: number;
}

export function GiftingCard({ product, index }: GiftingCardProps) {
  const { likedProducts, toggleLike } = useLikes();
  const { addToCart } = useCart();
  const { showAuthModal, executeWithAuth, handleAuthCancel } = useAuthGuard();
  const { toast } = useToast();
  const isWishlisted = likedProducts.some(p => p.id === product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      
      toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`,
        variant: "success"
      });
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    executeWithAuth(() => {
      const productForWishlist = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory || null,
        slug: product.slug,
        rating: product.rating,
        reviews: product.reviews,
        inStock: product.inStock === null ? null : product.inStock,
        isNew: product.isNew === null ? null : product.isNew,
        description: product.description,
        colors: null,
        sizes: null
      };
      
      toggleLike(productForWishlist);
    });
  };

  return (
    <>
      <Link href={`/products/${product.slug}`} className="block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden"
        >
          {/* Discount Badge */}
          {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
            <div className="absolute top-2 left-2 z-20">
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
              </div>
            </div>
          )}

          {/* Gift Badge - only show if no discount */}
          {!(product.originalPrice && Number(product.originalPrice) > Number(product.price || 0)) && (
            <div className="absolute top-2 left-2 z-20">
              <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                GIFT SET
              </div>
            </div>
          )}

          {/* Wishlist Heart */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>

          {/* Product Image */}
          <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Product Content */}
          <div className="p-4">
            {/* Product Name */}
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-gray-900">₹{Number(product.price || 0).toFixed(2)}</span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </motion.div>
      </Link>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthCancel}
        initialMode="signin"
      />
    </>
  );
}
