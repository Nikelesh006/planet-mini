import { motion } from "framer-motion";
import { Heart, ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";
import { useLikes } from "@/contexts/LikeContext";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function LikesPage() {
  const { likedProducts, removeFromLikes } = useLikes();
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const getDiscountPercentage = (original: number | undefined, current: number) => {
    if (!original) return null;
    return Math.round(((original - current) / original) * 100);
  };

  const isLiked = (id: number) => {
    return likedProducts.some(product => product.id === id);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-3 text-black hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-black flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                My Likes
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                {likedProducts.length} {likedProducts.length === 1 ? 'item' : 'items'} liked
              </p>
            </div>
          </div>
        </div>

        {likedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-primary/20">
              <Heart className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">No liked items yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Start liking products to see them here</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-black px-8 py-4 rounded-2xl font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-5">
            {likedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                className="group h-[400px] product-card"
              >
                <div
                  className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/30"
                >
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    {(product as any).isNew && (
                      <span className="text-black text-xs px-3 py-1 rounded-full font-bold shadow-lg bg-primary border-2 border-primary">
                        New
                      </span>
                    )}
                    {(product as any).inStock === false && (
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
                  <div className="aspect-square relative overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 p-2">
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-contain w-full h-full max-w-full max-h-full transform transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col relative">
                    {/* Action Buttons - Top Right */}
                    <div className="absolute top-1 right-4 flex gap-2">
                      <button
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromLikes(product.id);
                        }}
                      >
                        <Heart
                          className="w-4 h-4 text-red-500 fill-current transition-colors"
                        />
                      </button>

                      <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 ${
                          addedToCart === product.id 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: product.id.toString(),
                            name: product.name,
                            price: product.price,
                            image: product.image
                          });
                          setAddedToCart(product.id);
                          setTimeout(() => setAddedToCart(null), 2000);
                        }}
                      >
                        {addedToCart === product.id ? (
                          <span className="text-white text-xs font-bold">✓</span>
                        ) : (
                          <ShoppingCart className="w-4 h-4 text-black" />
                        )}
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
                    <p className="text-sm text-gray-700 line-clamp-2 min-h-[40px] font-medium">
                      {(product as any).description || `Beautiful ${product.name} for your little one. Made with premium materials and designed for comfort.`}
                    </p>

                    {/* Price - Above the line */}
                    <div className="flex items-center justify-between -mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-black">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      {!product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹199.99
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
