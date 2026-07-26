import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import type { BundleItem } from "@/contexts/CustomBagBundleContext";

const getCloudinaryImageUrl = (url: string, transformation: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/${transformation}/`);
};

interface CustomBagBundleSummaryProps {
  bundleItems: BundleItem[];
  bundleTotal: number;
  totalItems: number;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export function CustomBagBundleSummary({
  bundleItems,
  bundleTotal,
  totalItems,
  onRemoveItem,
  onUpdateQuantity
}: CustomBagBundleSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  if (bundleItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Bundle Summary Bar - Mobile: Bottom fixed, Desktop: Bottom fixed with better sizing */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 sm:shadow-xl">
        {/* Collapsed View */}
        <div className="px-3 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                  &#8377;{bundleTotal.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/bundle-checkout" className="flex-1 sm:flex-none">
                <button className="w-full bg-black text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-800 transition-all active:scale-95 text-xs sm:text-sm">
                  Checkout
                </button>
              </Link>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all active:scale-95 text-xs sm:text-sm font-medium"
              >
                {isExpanded ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              <div className="px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3 sm:mb-4 sticky top-0 bg-gray-50 pb-3 sm:pb-4 z-10">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Your Bundle</h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Bundle Items */}
                <div className="space-y-2 sm:space-y-3">
                  {bundleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getCloudinaryImageUrl(item.product.image, "f_auto,q_100,w_300")}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-gray-500 truncate">{item.variant}</p>
                        )}
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            &#8377;{(Number(item.product.sellingPrice || 0) * item.quantity).toFixed(0)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors text-sm sm:text-base"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total Summary */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 sticky bottom-0 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">Bundle Total</span>
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      &#8377;{bundleTotal.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
