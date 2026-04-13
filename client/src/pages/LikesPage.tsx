import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLikes } from "@/contexts/LikeContext";
import { ProductCard } from "@/components/ProductCard";
import type { ProductResponse } from "@shared/routes";

export default function LikesPage() {
  const { likedProducts, loading } = useLikes();

  // Debug logging
  console.log('❤️ LikesPage: likedProducts count:', likedProducts.length);
  console.log('❤️ LikesPage: loading state:', loading);
  console.log('❤️ LikesPage: likedProducts data:', likedProducts);

  return (
    <motion.div
      key="likes"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-white"
    >
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

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your liked items...</p>
          </div>
        ) : likedProducts.length === 0 ? (
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
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
