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
  
  // Image navigation state (for future multiple images support)
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // For now, we'll work with single image but prepare for multiple images
  // This can be extended when additionalImages field is added to the schema
  const productImages = [product.image]; // Single image for now
  
  // Handle multiple images - try different storage formats
  // const getProductImages = () => {
  //   const images = [];
    
  //   // Log the entire product structure for debugging
  //   console.log('=== PRODUCT DEBUG ===');
  //   console.log('Product name:', product.name);
  //   console.log('Product ID:', product.id);
  //   console.log('All product keys:', Object.keys(product));
  //   console.log('Full product object:', product);
    
  //   // Try to parse additional images from different possible formats
  //   try {
  //     // Check if product has an images array field (not in schema but might exist)
  //     if ((product as any).images && Array.isArray((product as any).images)) {
  //       console.log('Found images field:', (product as any).images);
  //       images.push(...(product as any).images);
  //     }
  //     // Check if product has additionalImages field
  //     else if ((product as any).additionalImages && Array.isArray((product as any).additionalImages)) {
  //       console.log('Found additionalImages field:', (product as any).additionalImages);
  //       images.push(...(product as any).additionalImages);
  //     }
  //     // Check if image field contains JSON array
  //     else if (product.image.startsWith('[')) {
  //       const parsedImages = JSON.parse(product.image);
  //       console.log('Parsed JSON from image field:', parsedImages);
  //       if (Array.isArray(parsedImages)) {
  //         images.push(...parsedImages);
  //       }
  //     }
  //     // Check if image field contains comma-separated URLs
  //     else if (product.image.includes(',')) {
  //       const splitImages = product.image.split(',').map(img => img.trim());
  //       console.log('Split comma-separated images:', splitImages);
  //       images.push(...splitImages);
  //     }
  //     // Check for any other possible fields
  //     else {
  //       // Check all possible image-related fields
  //       const possibleFields = ['image2', 'image3', 'secondImage', 'thirdImage', 'gallery', 'photos', 'img_urls', 'product_images'];
  //       possibleFields.forEach(field => {
  //         if ((product as any)[field]) {
  //           console.log(`Found ${field}:`, (product as any)[field]);
  //           if (Array.isArray((product as any)[field])) {
  //             images.push(...(product as any)[field]);
  //           } else {
  //             images.push((product as any)[field]);
  //           }
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     console.log('Could not parse additional images:', error);
  //   }
    
  //   console.log('Final additional images found:', images);
  //   console.log('=== END DEBUG ===');
    
  //   return images.filter(img => img && img !== product.image); // Return only additional images
  // };
  
  // const additionalImages = getProductImages();
  // const allImages = [product.image, ...additionalImages];
  // const hasMultipleImages = allImages.length > 1;
  
  // // Temporary test: Add mock images for the first product to test arrows
  // const testImages = hasMultipleImages ? allImages : [
  //   product.image,
  //   'https://picsum.photos/400/500?random=1', // Mock image 1
  //   'https://picsum.photos/400/500?random=2', // Mock image 2
  // ];
  // const finalImages = hasMultipleImages ? allImages : testImages;
  // const showArrows = hasMultipleImages || true; // Show arrows for testing
  
  // // Debug: Log image detection
  // console.log('Product:', product.name);
  // console.log('Main image:', product.image);
  // console.log('Additional images found:', additionalImages);
  // console.log('All images:', allImages);
  // console.log('Has multiple images:', hasMultipleImages);
  // console.log('Final images for display:', finalImages);
  // console.log('Show arrows:', showArrows);
  
  // const handlePreviousImage = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (showArrows) {
  //     setCurrentImageIndex((prev) => prev === 0 ? finalImages.length - 1 : prev - 1);
  //   }
  // };
  
  // const handleNextImage = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (showArrows) {
  //     setCurrentImageIndex((prev) => (prev + 1) % finalImages.length);
  //   }
  // };

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
          <div className="aspect-[3/4] flex items-center justify-center relative bg-transparent">
            {/* Discount Badge */}
            {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
              <div className="absolute top-2 left-2 z-20">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                </div>
              </div>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-3xl transition-all duration-300"
              draggable={false}
            />
            
            {/* Image Navigation Arrows - Only show if multiple images and on card hover */}
            {/* {showArrows && (
              <>
                <Left Arrow />
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-800" />
                </button>
                
                <Right Arrow />
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                >
                  <ChevronRight className="w-4 h-4 text-gray-800" />
                </button>
              </>
            )} */}
            
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
          <div className="p-3 bg-white text-center">
            {/* Product Name */}
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 leading-relaxed text-base">
              {product.name}
            </h3>

            {/* Product Description */}
            <p className="text-base text-gray-600 mb-2">
              {product.description || 'Perfect for your baby\'s daily care needs'}
            </p>

            {/* Price Section */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-base font-bold text-gray-900">&#8377;{Number(product.price || 0).toFixed(2)}</span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
                <span className="text-xs text-gray-500 line-through">
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
