import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Trash2, Edit, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useCustomBagBundle, type BundleItem } from "@/contexts/CustomBagBundleContext";

const getCloudinaryImageUrl = (url: string, transformation: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/${transformation}/`);
};

export default function BundleReview() {
  const [location, setLocation] = useLocation();
  const { showAuthModal, executeWithAuth, handleAuthCancel } = useAuthGuard();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { bundleItems, removeFromBundle, updateQuantity, bundleTotal, totalItems, clearBundle } = useCustomBagBundle();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = async () => {
    executeWithAuth(async () => {
      setIsProcessing(true);
      
      // Add all bundle items to cart
      let successCount = 0;
      let failedItems: string[] = [];
      
      console.log('Adding bundle items to cart:', bundleItems);
      
      for (const item of bundleItems) {
        console.log('Adding item:', item.product.name, 'ID:', item.product.id);
        try {
          const success = await addToCart({
            id: item.product.id.toString(),
            name: item.product.name,
            sellingPrice: Number(item.product.sellingPrice),
            mrp: item.product.mrp ? Number(item.product.mrp) : undefined,
            image: item.product.image,
            category: item.product.category,
            subcategory: item.product.subcategory || undefined,
            quantity: item.quantity,
            stockQuantity: item.product.stockQuantity ? Number(item.product.stockQuantity) : undefined,
          });
          
          if (success) {
            successCount++;
            console.log('Successfully added:', item.product.name);
          } else {
            failedItems.push(item.product.name);
            console.error('Failed to add:', item.product.name);
          }
        } catch (error) {
          failedItems.push(item.product.name);
          console.error('Error adding item:', item.product.name, error);
        }
      }

      console.log('Add to cart complete. Success:', successCount, 'Failed:', failedItems.length);

      if (successCount > 0) {
        toast({
          title: "Bundle Added to Cart!",
          description: `${successCount} items have been added to your cart.${failedItems.length > 0 ? ` ${failedItems.length} items failed.` : ''}`,
          variant: "success"
        });

        // Clear the bundle after adding to cart
        clearBundle();
        
        // Redirect to cart page
        setLocation('/cart');
      } else {
        toast({
          title: "Error",
          description: `Failed to add items to cart. Failed items: ${failedItems.join(', ')}`,
          variant: "destructive"
        });
      }
      
      setIsProcessing(false);
    });
  };

  const handleEditBundle = () => {
    // Return to customization flow
    setLocation('/shop/style?custom=true&filter=hospital-bags');
  };

  const handleCreateNewBox = () => {
    // Clear current bundle and start fresh
    clearBundle();
    setLocation('/shop/style?custom=true&filter=hospital-bags');
  };

  const handleRemoveItem = (itemId: string) => {
    console.log('Removing item:', itemId);
    removeFromBundle(itemId);
    toast({
      title: "Item Removed",
      description: "Item has been removed from your bundle.",
      variant: "default"
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  if (bundleItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Bundle is Empty</h2>
          <p className="text-gray-600 mb-6">Start customizing your hospital bag to see items here.</p>
          <Link
            href="/shop/style?custom=true&filter=hospital-bags"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Start Customizing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleEditBundle}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Edit Bundle</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Bundle Review</h1>
              </div>
              <button
                onClick={handleCreateNewBox}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create New Box</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bundle Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Your Custom Bundle</h2>
                  <p className="text-gray-600 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'} selected</p>
                </div>

                <div className="divide-y divide-gray-200">
                  {bundleItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-6"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getCloudinaryImageUrl(item.product.image, "f_auto,q_100,w_200")}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          {item.variant && (
                            <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
                          )}
                          {item.product.styleGroup && (
                            <p className="text-sm text-gray-500">Style: {item.product.styleGroup}</p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                              >
                                +
                              </button>
                            </div>

                            {/* Price */}
                            <div className="flex-1 text-right">
                              <p className="text-lg font-bold text-gray-900">
                                &#8377;{(Number(item.product.sellingPrice || 0) * item.quantity).toFixed(2)}
                              </p>
                              {item.product.mrp && Number(item.product.mrp) > Number(item.product.sellingPrice || 0) && (
                                <p className="text-sm text-gray-500 line-through">
                                  &#8377;{(Number(item.product.mrp) * item.quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-4">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>

                <div className="p-6 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      &#8377;{bundleTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Discount Calculation */}
                  {(() => {
                    const totalMRP = bundleItems.reduce((total, item) => {
                      return total + (Number(item.product.mrp || 0) * item.quantity);
                    }, 0);
                    const discount = totalMRP - bundleTotal;
                    
                    return discount > 0 ? (
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-semibold text-green-600">
                          -&#8377;{discount.toFixed(2)}
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">
                        &#8377;{bundleTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isProcessing || bundleItems.length === 0}
                      className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {isProcessing ? 'Adding to Cart...' : 'Add to Cart'}
                    </button>

                    <button
                      onClick={handleEditBundle}
                      className="w-full border-2 border-black text-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Bundle
                    </button>

                    <button
                      onClick={handleCreateNewBox}
                      className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create New Box
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthCancel}
        initialMode="signin"
      />
    </>
  );
}
