import { motion } from "framer-motion";

import { Heart, ArrowLeft } from "lucide-react";

import { Link } from "wouter";

import { useLikes } from "@/contexts/LikeContext";

import { BabyCareCard } from "@/components/BabyCareCard";

import type { ProductResponse } from "@shared/routes";



const BRAND = "#b4c49a";

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

      className="bg-white pt-16"

    >

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-4">

            <Link 

              href="/"

              className="p-3 text-black hover:text-[#b4c49a] rounded-full hover:bg-[#b4c49a]/10 transition-colors"

            >

              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />

            </Link>

            <div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black flex items-center gap-2 sm:gap-3">

                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND }}>

                  <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />

                </div>

                My Likes

              </h1>

              <p className="text-gray-600 mt-1 text-sm sm:text-lg">

                {likedProducts.length} {likedProducts.length === 1 ? 'item' : 'items'} liked

              </p>

            </div>

          </div>

        </div>



        {loading ? (

          <div className="text-center py-16">

            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: BRAND, borderTopColor: 'transparent' }}></div>

            <p className="text-gray-600 text-sm sm:text-lg">Loading your liked items...</p>

          </div>

        ) : likedProducts.length === 0 ? (

          <div className="text-center py-16">

            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-2" style={{ backgroundColor: `${BRAND}1A`, borderColor: `${BRAND}33` }}>

              <Heart className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: BRAND }} />

            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4">No liked items yet</h2>

            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-lg">Start liking products to see them here</p>

            <Link

              href="/"

              className="inline-flex items-center gap-2 sm:gap-3 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:opacity-90 text-sm sm:text-base"

              style={{ backgroundColor: BRAND }}

            >

              Start Shopping

            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">

            {likedProducts.map((product, index) => (

              <BabyCareCard

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

