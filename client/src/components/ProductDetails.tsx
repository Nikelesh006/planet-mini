import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag, Star, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/use-store";
import type { ProductResponse } from "@shared/routes";

interface ProductDetailsProps {
  product: ProductResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetails({ product, isOpen, onClose }: ProductDetailsProps) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors || "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes || "");

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const images = [product.image]; // Only use main image for now

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      quantity,
      color: selectedColor,
      size: selectedSize,
    });
    onClose();
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 h-full">
              {/* Left Column - Images */}
              <div className="relative bg-gray-50 p-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-gray-600 hover:text-gray-900 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Main Image */}
                <div className="aspect-square mb-4 bg-white rounded-2xl overflow-hidden">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index ? "border-primary" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Product Info */}
              <div className="p-8 flex flex-col">
                {/* Product Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                    {product.isNew && (
                      <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ₹{Number(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Product Options */}
                <div className="space-y-4 mb-6">
                  {/* Color Selection */}
                  {product.colors && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 text-sm rounded-lg border border-primary bg-primary text-primary-foreground">
                          {product.colors}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 text-sm rounded-lg border border-primary bg-primary text-primary-foreground">
                          {product.sizes}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.inStock ? (
                    <p className="text-sm text-green-600 font-medium">✓ In Stock</p>
                  ) : (
                    <p className="text-sm text-red-600 font-medium">✗ Out of Stock</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleWishlist}
                    className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
