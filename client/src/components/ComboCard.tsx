import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useLikes } from "@/contexts/LikeContext";
import { useCart } from "@/contexts/CartContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ProductResponse } from "@shared/routes";

interface ComboCardProps {
  product: ProductResponse;
  index: number;
}

export function ComboCard({ product, index }: ComboCardProps) {
  const { likedProducts, toggleLike } = useLikes();
  const { addToCart } = useCart();
  const { showAuthModal, executeWithAuth, handleAuthCancel } = useAuthGuard();
  const { toast } = useToast();
  const isWishlisted = likedProducts.some(p => p.id === Number(product.id));
  
  // Image navigation state (for future multiple images support)
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // For now, we'll work with single image but prepare for multiple images
  // This can be extended when additionalImages field is added to the schema
  const productImages = [product.image]; // Single image for now

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
        id: Number(product.id),
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

  const discountPercentage = product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) 
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <>
      <Link href={`/products/${product.slug}`} className="block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative transition-all duration-300 overflow-hidden"
        >
          {/* Discount Badge */}
          {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
              </div>
            </div>
          )}

          {/* Combo Badge - only show if no discount */}
          {!(product.originalPrice && Number(product.originalPrice) > Number(product.price || 0)) && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                3 PACK COMBO
              </div>
            </div>
          )}

          {/* Large Product Image */}
          <div className="aspect-[4/5] flex items-center justify-center relative bg-transparent">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-3xl transition-all duration-300"
            />
            
            {/* Wishlist Heart */}
            <button
              onClick={handleWishlist}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:bg-red-50"
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500 hover:fill-red-500'}`} />
            </button>
            
            {/* Quick Add Button - Reveals on Hover */}
            <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleQuickAdd}
                disabled={!product.inStock}
                className="w-full bg-white text-black py-2 px-3 text-sm font-medium hover:bg-gradient-to-r hover:from-primary hover:to-secondary transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg border border-gray-300"
              >
                {product.inStock ? "Quick Add" : "Out of Stock"}
              </button>
            </div>
          </div>

          {/* Product Content - Text Below Image */}
          <div className="p-4 bg-white text-center">
            {/* Product Name */}
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-3 leading-relaxed text-base">
              {product.name}
            </h3>

            {/* Product Description */}
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description || 'Perfect for your baby\'s daily care needs'}
            </p>

            {/* Price Section */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-base font-bold text-gray-900">&#8377;{Number(product.price || 0).toFixed(2)}</span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
                <span className="text-sm text-gray-500 line-through">
                  &#8377;{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
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
