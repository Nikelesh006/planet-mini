import { motion, AnimatePresence } from "framer-motion";

import { X, Heart, ShoppingBag, ChevronLeft, ChevronRight, Gift } from "lucide-react";

import { useState, useEffect } from "react";

import { useAuthGuard } from "@/hooks/useAuthGuard";

import GoogleAuthModal from "@/components/auth/GoogleAuthModal";

import { useToast } from "@/hooks/use-toast";

import { useCart } from "@/contexts/CartContext";

import { useLikes } from "@/contexts/LikeContext";

import { useCustomBagBundle } from "@/hooks/useCustomBagBundle";

import type { ProductResponse } from "@shared/routes";

import { isLowStock } from "@shared/stock";



interface CustomBagProductModalProps {

  isOpen: boolean;

  onClose: () => void;

  product: ProductResponse;

}



const getCloudinaryImageUrl = (url: string, transformation: string) => {

  if (!url || typeof url !== 'string') return url;

  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {

    return url;

  }

  return url.replace("/image/upload/", `/image/upload/${transformation}/`);

};



export function CustomBagProductModal({ isOpen, onClose, product }: CustomBagProductModalProps) {

  const [quantity, setQuantity] = useState(1);

  const [selectedVariant, setSelectedVariant] = useState(0);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { showAuthModal, executeWithAuth, handleAuthCancel } = useAuthGuard();

  const { toast } = useToast();

  const { addToCart } = useCart();

  const { likedProducts, toggleLike } = useLikes();

  const { addToBundle } = useCustomBagBundle();

  const isWishlisted = likedProducts.some(p => p.id === product.id);

  const lowStock = isLowStock(product);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);



  const productImages = [product.image]; // Add more images if available



  const handleAddToBag = () => {

    executeWithAuth(() => {

      addToBundle(product, quantity, product.styleVariant || undefined, selectedVariant);



      toast({

        title: "Added to Bundle!",

        description: `${product.name} has been added to your custom bag bundle.`,

        variant: "success"

      });

      onClose();

    });

  };



  const handleAddToCart = () => {

    executeWithAuth(() => {

      addToCart({

        id: product.id.toString(),

        name: product.name,

        sellingPrice: Number(product.sellingPrice),

        mrp: product.mrp ? Number(product.mrp) : undefined,

        image: product.image,

        category: product.category,

        subcategory: product.subcategory || undefined,

        quantity: quantity,

      });



      toast({

        title: "Added to Cart!",

        description: `${product.name} has been added to your cart.`,

        variant: "success"

      });

      onClose();

    });

  };



  const handleWishlist = () => {

    executeWithAuth(() => {

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

      

      toggleLike(productForWishlist);

    });

  };



  const handlePreviousImage = () => {

    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));

  };



  const handleNextImage = () => {

    setCurrentImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));

  };



  return (

    <>

      <AnimatePresence>

        {isOpen && (

          <>

            {/* Backdrop */}

            <motion.div

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              exit={{ opacity: 0 }}

              onClick={onClose}

              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"

            />



            {/* Modal */}

            <motion.div

              initial={{ opacity: 0, scale: 0.95 }}

              animate={{ opacity: 1, scale: 1 }}

              exit={{ opacity: 0, scale: 0.95 }}

              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8"

            >

              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

                {/* Close Button */}

                <button

                  onClick={onClose}

                  className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-gray-100 transition-all"

                >

                  <X className="w-5 h-5" />

                </button>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

                  {/* Product Images */}

                  <div className="relative">

                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                      {product.mrp && Number(product.mrp) > Number(product.sellingPrice || 0) && (

                        <div className="absolute top-4 left-4 z-20">

                          <div className="bg-red-600 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold text-white shadow-md rounded-md">

                            {Math.round(((Number(product.mrp) - Number(product.sellingPrice)) / Number(product.mrp)) * 100)}% OFF

                          </div>

                        </div>

                      )}

                      

                      <img

                        src={getCloudinaryImageUrl(productImages[currentImageIndex], "f_auto,q_100,dpr_auto")}

                        alt={product.name}

                        className="w-full h-full object-cover"

                      />



                      {/* Image Navigation */}

                      {productImages.length > 1 && (

                        <>

                          <button

                            onClick={handlePreviousImage}

                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-gray-100 transition-all"

                          >

                            <ChevronLeft className="w-4 h-4" />

                          </button>

                          <button

                            onClick={handleNextImage}

                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-gray-100 transition-all"

                          >

                            <ChevronRight className="w-4 h-4" />

                          </button>

                        </>

                      )}

                    </div>



                    {/* Image Indicators */}

                    {productImages.length > 1 && (

                      <div className="flex justify-center gap-2 mt-4">

                        {productImages.map((_, index) => (

                          <button

                            key={index}

                            onClick={() => setCurrentImageIndex(index)}

                            className={`w-2 h-2 rounded-full transition-all ${

                              index === currentImageIndex ? 'bg-black' : 'bg-gray-300'

                            }`}

                          />

                        ))}

                      </div>

                    )}

                  </div>



                  {/* Product Details */}

                  <div className="flex flex-col">

                    <div className="flex-1">

                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">

                        {product.name}

                      </h2>



                      {/* Price */}

                      <div className="flex items-baseline gap-3 mb-4">

                        <span className="text-3xl font-extrabold text-slate-900">

                          &#8377;{Number(product.sellingPrice || 0).toFixed(0)}

                        </span>

                        {product.mrp && Number(product.mrp) > Number(product.sellingPrice || 0) && (

                          <>

                            <span className="text-xl font-medium text-slate-500 line-through">

                              &#8377;{Number(product.mrp).toFixed(0)}

                            </span>

                            <span className="text-sm font-medium text-green-600">

                              Save &#8377;{(Number(product.mrp) - Number(product.sellingPrice || 0)).toFixed(0)}

                            </span>

                          </>

                        )}

                      </div>



                      {/* Stock Status */}

                      {!product.inStock && (

                        <div className="mb-4">

                          <span className="inline-flex items-center gap-1 text-red-600 font-medium">

                            <Gift className="w-4 h-4" />

                            Out of Stock

                          </span>

                        </div>

                      )}



                      {/* Description */}

                      <div className="mb-6">

                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>

                        <p className="text-gray-600 text-sm leading-relaxed">

                          {product.description || 'No description available'}

                        </p>

                      </div>



                      {/* Product Details */}

                      <div className="mb-6 space-y-2">

                        {product.styleGroup && (

                          <div className="flex justify-between text-sm">

                            <span className="text-gray-500">Style:</span>

                            <span className="text-gray-900 font-medium">{product.styleGroup}</span>

                          </div>

                        )}

                        {product.styleVariant && (

                          <div className="flex justify-between text-sm">

                            <span className="text-gray-500">Variant:</span>

                            <span className="text-gray-900 font-medium">{product.styleVariant}</span>

                          </div>

                        )}

                        {product.category && (

                          <div className="flex justify-between text-sm">

                            <span className="text-gray-500">Category:</span>

                            <span className="text-gray-900 font-medium">{product.category}</span>

                          </div>

                        )}

                        {product.subcategory && (

                          <div className="flex justify-between text-sm">

                            <span className="text-gray-500">Subcategory:</span>

                            <span className="text-gray-900 font-medium">{product.subcategory}</span>

                          </div>

                        )}

                      </div>



                      {/* Quantity Selector */}

                      <div className="mb-6">

                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Quantity</h3>

                        <div className="flex items-center gap-3">

                          <button

                            onClick={() => setQuantity(Math.max(1, quantity - 1))}

                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"

                            disabled={quantity <= 1}

                          >

                            -

                          </button>

                          <span className="w-12 text-center font-semibold">{quantity}</span>

                          <button

                            onClick={() => setQuantity(quantity + 1)}

                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"

                          >

                            +

                          </button>

                        </div>

                      </div>

                    </div>



                    {/* Action Buttons */}

                    <div className="space-y-3 mt-auto">

                      <button

                        onClick={handleAddToBag}

                        disabled={!product.inStock}

                        className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"

                      >

                        <ShoppingBag className="w-5 h-5" />

                        {product.inStock ? 'Add to Bag' : 'Out of Stock'}

                      </button>



                      <button

                        onClick={handleAddToCart}

                        disabled={!product.inStock}

                        className="w-full bg-gray-100 text-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"

                      >

                        <ShoppingBag className="w-5 h-5" />

                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}

                      </button>



                      <button

                        onClick={handleWishlist}

                        className="w-full border-2 border-black text-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"

                      >

                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />

                        {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>

          </>

        )}

      </AnimatePresence>



      {/* Google Auth Modal */}

      <GoogleAuthModal

        isOpen={showAuthModal}

        onClose={handleAuthCancel}

        initialMode="signin"

      />

    </>

  );

}

