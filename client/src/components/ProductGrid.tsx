import { motion } from "framer-motion";

import { Link } from "wouter";

import { ShoppingCart, Star, Heart, Package, Plus, Minus } from "lucide-react";

import { useLikes } from "@/contexts/LikeContext";



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
}

export default function ProductGrid({ products, title, showLoadMore = false }: ProductGridProps) {
  const { toggleLike, isLiked } = useLikes();

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

  const navigateToProduct = (slug: string) => {
    window.location.href = `/products/${slug}`;
  };

  return (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id || `product-${index}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            className="group h-[380px] product-card"
          >
            <div
              className={`relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/30`}
              onClick={() => navigateToProduct(product.slug)}
            >
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex gap-2">
                {product.isNew && (
                  <span className="text-black text-xs px-3 py-1 rounded-full font-bold shadow-lg bg-primary border-2 border-primary">
                    New
                  </span>
                )}
                {!product.inStock && (
                  <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute top-3 right-3 z-10 text-black text-xs px-3 py-1 rounded-full font-bold shadow-lg bg-secondary border-2 border-secondary hover:bg-secondary/90">
                  -{getDiscountPercentage(product.originalPrice, product.price)}%
                </div>
              )}

              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-contain w-full h-full max-w-full max-h-full transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col relative">
                {/* Action Buttons - Top Right */}
                <div className="absolute top-1 right-4 flex gap-2">
                  <button
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike({
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                        originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : undefined,
                        image: product.image,
                        category: product.category || undefined,
                        rating: product.rating,
                        reviews: product.reviews
                      });
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isLiked(product.id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    />
                  </button>

                  <button
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProduct(product.slug);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 text-black" />
                  </button>
                </div>

                {/* Rating - Top Left */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviews || 0})
                  </span>
                </div>

                {/* Product Name */}
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-bold text-black mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-2 line-clamp-2 min-h-[40px] font-medium">
                    {product.description}
                </p>

                {/* Price - Always Visible */}
                <div className="mt-auto pt-3 border-t border-gray-200 bg-gray-50 -mx-4 px-4 -mb-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-black bg-white px-2 py-1 rounded">
                        ₹{product.price ? Number(product.price).toFixed(2) : '99.99'}
                      </span>
                      {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
                        <span className="text-sm text-gray-500 line-through bg-white px-2 py-1 rounded">
                          ₹{Number(product.originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {!product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through bg-white px-2 py-1 rounded">
                        ₹199.99
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showLoadMore && (
        <div className="text-center mt-12">
          <button className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden">
            <span className="relative z-10">Load More Products</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      )}
    </div>
  );
}

