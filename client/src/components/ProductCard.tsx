import { Link } from "wouter";

import { Heart, ShoppingBag, Star, Gift } from "lucide-react";

import { motion } from "framer-motion";

import { useState } from "react";



import { useLikes } from "@/contexts/LikeContext";



import { useCart } from "@/contexts/CartContext";



import { useAuthGuard } from "@/hooks/useAuthGuard";



import GoogleAuthModal from "@/components/auth/GoogleAuthModal";



import { useToast } from "@/hooks/use-toast";



import type { ProductResponse } from "@shared/routes";

import { isLowStock, isOutOfStock } from "@shared/stock";







const getCloudinaryImageUrl = (url: string, transformation: string) => {

  if (!url || typeof url !== 'string') return url;

  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {

    return url;

  }

  return url.replace("/image/upload/", `/image/upload/${transformation}/`);

};



interface ProductCardProps {



  product: ProductResponse;



  index: number;



}







export function ProductCard({ product, index }: ProductCardProps) {



  const { likedProducts, toggleLike } = useLikes();



  const { addToCart } = useCart();



  const { showAuthModal, executeWithAuth, handleAuthSuccess, handleAuthCancel, isUserLoggedIn } = useAuthGuard();



  const { toast } = useToast();



  const isWishlisted = likedProducts.some(p => p.id === product.id);

  const outOfStock = isOutOfStock(product);

  const lowStock = isLowStock(product);



  // Debug logging

  console.log('ProductCard Debug:', {

    productId: product.id,

    productName: product.name,

    likedProducts: likedProducts.map(p => ({ id: p.id, name: p.name })),

    isWishlisted,

    likedProductsCount: likedProducts.length

  });



  const handleQuickAdd = (e: React.MouseEvent) => {



    e.preventDefault();



    e.stopPropagation();



    if (outOfStock) {

      toast({

        title: "Out of Stock",

        description: "This product is currently unavailable.",

        variant: "destructive"

      });

      return;

    }

    



    // Execute add to cart with auth guard



    executeWithAuth(() => {



      addToCart({



        id: product.id.toString(),



        name: product.name,



        sellingPrice: Number(product.sellingPrice),



        mrp: product.mrp ? Number(product.mrp) : undefined,



        image: product.image,



        category: product.category,



        subcategory: product.subcategory || undefined,

        stockQuantity: product.stockQuantity,



      });



      



      // Show toast notification instead of redirecting



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



    



    console.log('🔐 Wishlist button clicked, user logged in:', isUserLoggedIn);



    



    // Execute wishlist with auth guard



    executeWithAuth(() => {



      console.log('✅ Executing wishlist action');



      



      // Convert product to the format expected by toggleLike



      const productForWishlist = {



        id: product.id,



        name: product.name,



        sellingPrice: Number(product.sellingPrice),



        mrp: product.mrp ? Number(product.mrp) : null,



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



      



      console.log('https://planet-mini.onrender.com/api/profile/${user.id}/wishlist');

      console.log('Product for wishlist:', productForWishlist);

      

      // Debug: Check current liked products before toggle

      console.log('Before toggle - Current liked products:', likedProducts.map(p => ({ id: p.id, name: p.name })));



      toggleLike(productForWishlist);

      toast({

        title: isWishlisted ? "Removed from Likes" : "Added to Likes!",

        description: isWishlisted 

          ? `${product.name} has been removed from your liked products.` 

          : `${product.name} has been added to your liked products.`,

        variant: isWishlisted ? "default" : "success"

      });



    });



  };







  return (



    <>



      {/* Debug logging */}



      {(() => {



        console.log('🔗 ProductCard: Navigating to:', `/products/${product.slug}`, 'Product:', product.name, 'Slug:', product.slug);



        return null;



      })()}



      



      <Link href={`/products/${product.slug}`} className="block">



        <motion.div



        initial={{ opacity: 0, y: 20 }}



        animate={{ opacity: 1, y: 0 }}



        transition={{ duration: 0.5, delay: index * 0.1 }}



        className={`group relative flex flex-col cursor-pointer h-[450px] hover:shadow-lg transition-all duration-500 ease-out border border-gray-300 rounded-3xl overflow-hidden bg-white ${outOfStock ? "opacity-75" : ""}`}



      >



        <div className="relative aspect-[4/5] mb-2 bg-muted/30 rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 flex-shrink-0 flex items-center justify-center">



          <img



            src={getCloudinaryImageUrl(product.image, "f_auto,q_100,dpr_auto")}



            alt={product.name}



            className={`object-contain w-full h-full max-w-full max-h-full transform transition-transform duration-700 group-hover:scale-105 ${outOfStock ? "grayscale opacity-70" : ""}`}



            draggable={false}



          />



          



          {/* Badges */}

          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-30">

            {!outOfStock && product.mrp && Number(product.mrp) > Number(product.sellingPrice || 0) && (() => {

              const originalPrice = Number(product.mrp);

              const currentPrice = Number(product.sellingPrice || 0);

              const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

              return (

                <span className="bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-md">

                  {discountPercentage}% OFF

                </span>

              );

            })()}



          </div>







          {/* Floating Actions */}



          <div className="absolute top-4 right-4 flex flex-col gap-2">



            <button



              onClick={handleWishlist}



              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-foreground hover:text-primary transition-colors active:scale-95"



            >



              <motion.div
                whileTap={{ scale: 1.4 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500 hover:fill-red-500'}`} />
              </motion.div>



            </button>



          </div>







          {/* Quick Add Button */}



          <div className="absolute inset-x-0 bottom-4 px-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">



            <button



              onClick={handleQuickAdd}



              disabled={outOfStock}



              className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md text-foreground font-semibold shadow-lg hover:bg-red-100 hover:text-red-700 transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"



            >



              <ShoppingBag className="w-5 h-5" />



              {outOfStock ? "Out of Stock" : "Quick Add"}



            </button>



          </div>



        </div>







        <div className="px-2 flex flex-col gap-3 flex-1 pt-3 pb-2">



          <h3 className="font-display font-bold text-xl text-black">

            {product.name}

          </h3>



          <div className="flex items-baseline gap-2">

            <span className="text-lg font-medium text-slate-900">₹{Number(product.sellingPrice || 0).toFixed(0)}</span>

            <span className="text-sm font-medium text-slate-500 line-through">

              {product.mrp ? `₹${Number(product.mrp).toFixed(0)}` : ''}

            </span>

          </div>

          {product.mrp && Number(product.mrp) > Number(product.sellingPrice || 0) && (

            <p className="flex items-center gap-1 text-xs font-medium text-green-600">

              <Gift className="w-3 h-3" />

              You save ₹{(Number(product.mrp) - Number(product.sellingPrice || 0)).toFixed(0)}

            </p>

          )}

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



