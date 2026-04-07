import { motion } from "framer-motion";
import { useState } from "react";

import { Link } from "wouter";

import { Heart, ShoppingBag } from "lucide-react";

import { useLikes } from "@/contexts/LikeContext";
import { useCart } from "@/contexts/CartContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useToast } from "@/hooks/use-toast";

interface Product {

  id: number;

  name: string;

  slug: string;

  description: string;

  price: number | string;

  originalPrice?: number | string | null;

  image: string;

  rating?: number;

  reviews?: number;

  inStock?: boolean | null;

  isNew?: boolean | null;

  category?: string | null;

  colors?: string | null;

  sizes?: string | null;

}

interface ProductGridProps {

  products: Product[];

  title?: string;

  showLoadMore?: boolean;

  layout?: 'cards' | 'boxed';

}

export default function ProductGrid({ products, title, showLoadMore = false, layout = 'cards' }: ProductGridProps) {
  const { likedProducts, toggleLike } = useLikes();
  const { addToCart } = useCart();
  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel, isUserLoggedIn } = useAuthGuard();
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${num.toFixed(2)}`;
  };

  const getDiscountPercentage = (original: number | string | undefined, current: number | string) => {
    if (!original) return null;
    const orig = typeof original === 'string' ? parseFloat(original) : original;
    const curr = typeof current === 'string' ? parseFloat(current) : current;
    return Math.round(((orig - curr) / orig) * 100);
  };

  const toggleDescription = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
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
        category: product.category ?? undefined,
        subcategory: undefined,
        color: product.colors || undefined,
        size: product.sizes || undefined,
      });
      
      // Show toast notification instead of redirecting
      toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`,
        variant: "success"
      });
    });
  };

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Execute wishlist with auth guard
    executeWithAuth(() => {
      // Convert product to the format expected by toggleLike
      const productForWishlist = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        image: product.image,
        category: product.category || 'Uncategorized',
        subcategory: null,
        colors: product.colors ?? null,
        sizes: product.sizes ?? null,
        slug: product.slug,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        inStock: product.inStock ?? null,
        isNew: product.isNew ?? null,
        description: product.description,
      };
      
      toggleLike(productForWishlist);
    });
  };

  return (
    <>
      <div className="space-y-8">
        {title && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-2">{title}</h2>
            <div className="flex justify-center gap-2">
              <div className="w-8 h-1 bg-primary rounded-full"></div>
              <div className="w-8 h-1 bg-secondary rounded-full"></div>
              <div className="w-8 h-1 bg-primary rounded-full"></div>
            </div>
          </div>
        )}

        {layout === 'boxed' ? (
        // Super Saver Offers - Images only layout
        <div className="relative w-full max-w-4xl mx-auto" style={{ height: '300px' }}>
          {products.map((product, index) => {
            // Define independent positions for each card
            const positions = [
              '-left-8 top-8',      // First card - moved further left and down
              'left-1/2 top-8 -translate-x-1/2',  // Second card - top center and down
              '-right-8 top-8'      // Third card - moved further right and down
            ];
            
            return (
              <div key={product.id || `product-${index}`} className={`absolute ${positions[index]} w-64`}>
                <div className="relative group">
                  {/* Coupon Badge - Top Left Corner */}
                  <div className="absolute -top-3 -left-3 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transform rotate-12 border-2 border-white z-10">
                    <span className="text-sm font-bold">
                      {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (() => {
                        const originalPrice = Number(product.originalPrice);
                        const currentPrice = Number(product.price || 0);
                        const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                        return `-${discountPercentage}%`;
                      })() || 'DEAL'}
                    </span>
                  </div>

                  {/* Price Tag - Top Right Corner */}
                  <div className="absolute -top-12 -right-4 bg-white rounded-lg shadow-lg border-2 border-gray-300 z-10 transform rotate-2">
                    <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-t-lg text-center">
                      SAVE
                    </div>
                    <div className="px-3 py-2 text-center">
                      <div className="text-gray-400 text-xs line-through">
                        {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && 
                          `₹${Number(product.originalPrice).toFixed(2)}`
                        }
                      </div>
                      <div className="text-red-600 text-lg font-bold">
                        ₹{Number(product.price || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rotate-45 border-l border-b border-gray-400"></div>
                  </div>
                  
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="aspect-square overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border-2 border-red-200 group-hover:border-red-400 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Original card layout for other sections
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, index) => (
            <div key={product.id || `product-${index}`} className="w-full">
              <Link href={`/products/${product.slug}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative flex flex-col cursor-pointer h-[450px] hover:shadow-lg transition-all duration-500 ease-out border border-gray-300 rounded-3xl overflow-hidden bg-white"
                >
                <div className="relative aspect-[4/5] mb-2 bg-muted/30 rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={product.image}
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
                      onClick={(e) => handleWishlist(e, product)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-foreground hover:text-primary transition-colors active:scale-95"
                    >
                      <Heart className={`w-5 h-5 ${likedProducts.some(p => p.id === product.id) ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>

                  {/* Quick Add Button */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
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
                    onClick={(e) => toggleDescription(e, product.id.toString())}
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
            </div>
          ))}
        </div>
      )}

        {showLoadMore && (
          <div className="text-center mt-12">
            <button className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden">
              <span className="relative z-10">Load More Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        )}
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthCancel}
        initialMode="signin"
      />
    </>
  );
}

