import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Trash2, Edit, Plus, X, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GoogleAuthModal from "@/components/auth/GoogleAuthModal";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useGiftBundle, type GiftBundleItem } from "@/contexts/GiftBundleContext";

const getCloudinaryImageUrl = (url: string, transformation: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/${transformation}/`);
};

export default function GiftBundleReview() {
  const [location, setLocation] = useLocation();
  const { showAuthModal, executeWithAuth, handleAuthCancel } = useAuthGuard();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { giftBundleItems, removeFromGiftBundle, updateGiftQuantity, giftBundleTotal, giftTotalItems, clearGiftBundle } = useGiftBundle();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = async () => {
    executeWithAuth(async () => {
      setIsProcessing(true);
      
      // Generate a unique bundle ID for this gift bundle
      const bundleId = `gift-bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add all bundle items to cart
      let successCount = 0;
      let failedItems: string[] = [];
      
      console.log('Adding gift bundle items to cart:', giftBundleItems);
      
      for (const item of giftBundleItems) {
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
            source: 'gift-bundle',
            bundleId: bundleId,
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
          title: "Gift Bundle Added to Cart!",
          description: `${successCount} items have been added to your cart.${failedItems.length > 0 ? ` ${failedItems.length} items failed.` : ''}`,
          variant: "success"
        });

        // Clear the bundle after adding to cart
        clearGiftBundle();
        
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
    // Return to gift customization flow
    setLocation('/shop/style?custom=gift');
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromGiftBundle(itemId);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateGiftQuantity(itemId, newQuantity);
  };

  if (giftBundleItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Gift Bundle is Empty</h2>
          <p className="text-gray-600 mb-6">Add some items to create your perfect gift bundle</p>
          <Link
            href="/shop/style?custom=gift"
            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop/style?custom=gift" className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Shopping</span>
            </Link>
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-pink-500" />
              <h1 className="text-xl font-bold text-gray-900">Gift Bundle Review</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bundle Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bundle Items ({giftTotalItems})</h2>
                <button
                  onClick={handleEditBundle}
                  className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit Bundle</span>
                </button>
              </div>

              <div className="space-y-4">
                {giftBundleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100"
                  >
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={getCloudinaryImageUrl(item.product.image, 'w_200,h_200,c_fill')}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='%23F9FAFB'%3E%3Crect width='24' height='24' fill='%23F9FAFB'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23D1D5DB' font-size='12' font-family='Arial'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.product.category} {item.product.subcategory && `• ${item.product.subcategory}`}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-lg font-bold text-pink-600">
                          ₹{Number(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="flex-shrink-0 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-4"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({giftTotalItems} items)</span>
                  <span className="font-medium">₹{giftBundleTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Gift Packaging</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-pink-600">₹{giftBundleTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding to Cart...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Add Gift Bundle to Cart
                  </span>
                )}
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>🎁 Perfect for gifting your loved ones</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {showAuthModal && <GoogleAuthModal isOpen={showAuthModal} onClose={handleAuthCancel} />}
    </div>
  );
}

function Minus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
    </svg>
  );
}
