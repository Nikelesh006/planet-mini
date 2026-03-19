import { motion } from "framer-motion";
import { Link } from "wouter";
import ProductGrid from "@/components/ProductGrid";
import { Sparkles } from "lucide-react";
import { useStyleProducts } from "@/hooks/useProducts";

export default function ShopStyle() {
  // Fetch all style products (no subcategory filter)
  const { data: products, isLoading } = useStyleProducts();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
            
            Shop by Style
            
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Find the perfect style for your little one with our curated collection
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pt-0 pb-8 lg:pb-16 lg:px-16 lg:pt-2">
          {/* Dynamic Products */}
          {!isLoading && products && products.length > 0 && (
            <ProductGrid 
              products={products} 
              title=""
            />
          )}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center py-8">
                <p className="text-gray-500">No style products available yet.</p>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}

