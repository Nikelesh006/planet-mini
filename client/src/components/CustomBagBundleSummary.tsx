import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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

  if (bundleItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bundle Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        {/* Collapsed View */}
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  &#8377;{bundleTotal.toFixed(0)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span className="text-sm font-medium">Hide</span>
                  <ChevronLeft className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">View Bundle</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
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
              className="border-t border-gray-200"
            >
              <div className="px-4 py-4 sm:px-6 sm:py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Your Bundle</h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Bundle Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bundleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                        <img
                          src={getCloudinaryImageUrl(item.product.image, "f_auto,q_100,w_200")}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-gray-500">{item.variant}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-gray-900">
                            &#8377;{(Number(item.product.sellingPrice || 0) * item.quantity).toFixed(0)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Bundle Total</span>
                    <span className="text-xl font-bold text-gray-900">
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
