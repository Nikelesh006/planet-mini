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

const getCloudinaryImageUrl = (url: string, transformation: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/${transformation}/`);
};

interface BabyCareCardProps {
  product: ProductResponse;
  index: number;
}

export function BabyCareCard({ product, index }: BabyCareCardProps) {
  const { likedProducts, toggleLike } = useLikes();
  const { addToCart } = useCart();
  const { showAuthModal, executeWithAuth, handleAuthCancel } = useAuthGuard();
  const { toast } = useToast();
  const isWishlisted = likedProducts.some(p => p.id === product.id);
  
  const productImages = [product.image]; 
  
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
          className="group relative transition-all duration-300 overflow-hidden"
        >
          
          {/* Large Product Image */}
          <div className="aspect-[2/3] sm:aspect-[3/4] flex items-center justify-center relative bg-transparent">
            {/* Discount Badge */}
            {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-md">
                  {Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}% OFF
                </div>
              </div>
            )}
            <img
              src={getCloudinaryImageUrl(product.image, "f_auto,q_100,dpr_auto")}
              alt={product.name}
              className="w-full h-full object-cover rounded-3xl transition-all duration-300"
              draggable={false}
            />
            
            {/* Wishlist Heart */}
            <button
              onClick={handleWishlist}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:bg-red-50"
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500 hover:fill-red-500'}`} />
            </button>
            
            {/* Quick Add Button - Reveals on Hover */}
            <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleQuickAdd}
                disabled={!product.inStock}
                className="w-full bg-white text-black py-2 px-3 text-sm font-medium hover:bg-red-100 hover:text-red-700 transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg border border-gray-300"
              >
                {product.inStock ? "Quick Add" : "Out of Stock"}
              </button>
            </div>
          </div>

          {/* Product Content - Text Below Image */}
          <div className="p-1 sm:p-3 bg-white text-center">
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-relaxed text-base sm:text-lg">
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">&#8377;{Number(product.price || 0).toFixed(2)}</span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
                <span className="text-sm font-medium text-slate-500 line-through">
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
