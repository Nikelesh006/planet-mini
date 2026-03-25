import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

import { useLikes } from "@/contexts/LikeContext";
import { useCart } from "@/contexts/CartContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { likedProducts, toggleLike } = useLikes();
  const { addToCart } = useCart();
  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel, isUserLoggedIn } = useAuthGuard();
  
  const isWishlisted = likedProducts.some(p => p.id === product.id.toString());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Use a fallback placeholder if the URL is broken
  const imageUrl = product.image || "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=600&fit=crop";

  const colors: string[] = Array.isArray(product.colors)
    ? product.colors
    : (typeof product.colors === 'string' ? [product.colors] : []);

  const toggleDescription = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Execute wishlist with auth guard
    executeWithAuth(() => {
      // Convert product to the format expected by toggleLike
      const productForWishlist = {
        id: product.id.toString(),
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory || undefined,
        slug: product.slug,
        rating: product.rating,
        reviews: product.reviews,
        inStock: product.inStock === null ? undefined : product.inStock,
        isNew: product.isNew === null ? undefined : product.isNew,
        description: product.description,
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
          className="group relative flex flex-col cursor-pointer h-[450px] hover:shadow-lg transition-all duration-500 ease-out border border-gray-300 rounded-3xl overflow-hidden bg-white"
        >
          <div className="relative aspect-[4/5] mb-2 bg-muted/30 rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 flex-shrink-0 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={product.name}
              className="object-contain w-full h-full max-w-full max-h-full transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (() => {
                const originalPrice = Number(product.originalPrice);
                const currentPrice = Number(product.price || 0);
                const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                return (
                  <span className="px-3 py-1 text-xs font-semibold bg-secondary text-black rounded-full shadow-sm">
                    -{discountPercentage}%
                  </span>
                );
              })()}
            </div>

            {/* Floating Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleWishlist}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-foreground hover:text-primary transition-colors active:scale-95"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleQuickAdd}
                disabled={!product.inStock}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md text-foreground font-semibold shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95 disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.inStock ? "Quick Add" : "Out of Stock"}
              </button>
            </div>
          </div>

          <div className="px-2 flex flex-col gap-3 flex-1 pt-3 pb-2">
            <h3 className="font-display font-bold text-lg text-black">
              {product.name}
            </h3>

            {/* Description */}
            <p 
              className="text-sm text-muted-foreground font-bold cursor-pointer line-clamp-1"
              onClick={toggleDescription}
            >
              {product.description || 'Premium quality product for your little one'}
            </p>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-black">₹{Number(product.price || 0).toFixed(2)}</span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{Number(product.originalPrice || product.price || 0).toFixed(2)}
              </span>
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
