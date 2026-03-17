import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "@shared/schema";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  // Use a fallback placeholder if the URL is broken
  const imageUrl = product.image || "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=600&fit=crop";

  const colors: string[] = Array.isArray(product.colors)
    ? product.colors
    : (typeof product.colors === 'string' ? [product.colors] : []);

  const handleNavigate = () => {
    window.location.href = `/products/${product.slug}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col bg-card rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
      onClick={handleNavigate}
    >
      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full shadow-sm">
            NEW
          </span>
        )}
        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
          <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full shadow-sm">
            SALE
          </span>
        )}
      </div>

      <Link
        href={`/products/${product.slug}`}
        onClick={(e) => e.stopPropagation()}
        className="block relative aspect-[4/5] overflow-hidden rounded-2xl mb-4 bg-muted"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Quick add to cart overlay (desktop hover) */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <button 
            className="w-full py-3 bg-white/90 backdrop-blur text-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Prevent default prevents navigation. We'd ideally open a quick-add modal here
              // or navigate to detail page for size/color selection.
              window.location.href = `/products/${product.slug}`;
            }}
          >
            <ShoppingCart className="w-4 h-4" /> View Options
          </button>
        </div>
      </Link>

      <div className="flex flex-col flex-grow px-2 pb-2">
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-muted-foreground">{product.rating} ({product.reviews})</span>
        </div>
        
        <Link href={`/products/${product.slug}`} onClick={(e) => e.stopPropagation()} className="flex-grow">
          <h3 className="font-display font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {product.category} {product.subcategory ? `· ${product.subcategory}` : ''}
          </p>
        </Link>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg">₹{Number(product.price).toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through decoration-destructive/50 decoration-2">
                ₹{Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          {/* Color swatches hint */}
          {colors.length > 0 && (
            <div className="flex -space-x-1.5">
              {colors.slice(0, 3).map((color: string, i: number) => (
                <div 
                  key={i} 
                  className="w-5 h-5 rounded-full border-2 border-card shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              {colors.length > 3 && (
                <div className="w-5 h-5 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                  +{colors.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
