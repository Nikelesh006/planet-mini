import { Link } from "wouter";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { useCart } from "@/contexts/CartContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import type { ProductResponse } from "@shared/routes";

interface ProductCardProps {
  product: ProductResponse;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useStore();
  const { addToCart } = useCart();
  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel } = useAuthGuard();
  const isWishlisted = wishlist.includes(product.id);

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
    toggleWishlist(product.id);
  };

  return (
    <>
      <Link href={`/products/${product.slug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative flex flex-col cursor-pointer"
      >
        <div className="relative aspect-[4/5] mb-4 bg-muted/30 rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            {product.isNew && (
              <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full shadow-sm">
                New
              </span>
            )}
            {product.originalPrice && (
              <span className="px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground rounded-full shadow-sm">
                Sale
              </span>
            )}
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
          <div className="absolute inset-x-0 bottom-4 px-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
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

        <div className="px-2 flex flex-col gap-1">
          <h3 className="font-display font-medium text-lg text-foreground truncate hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary-foreground">₹{Number(product.price).toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{Number(product.originalPrice).toFixed(2)}
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
