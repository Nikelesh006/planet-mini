import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { CartItem } from "@/contexts/CartContext";

interface BundleItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleItems: CartItem[];
  bundleId: string;
}

const getCloudinaryImageUrl = (url: string, transformation: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/${transformation}/`);
};

export default function BundleItemsModal({ isOpen, onClose, bundleItems, bundleId }: BundleItemsModalProps) {
  const bundleTotal = bundleItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalItems = bundleItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hospital Bundle Items</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'} in this bundle</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {bundleItems.map((item, index) => (
                    <motion.div
                      key={`${bundleId}-${item.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                        <img
                          src={getCloudinaryImageUrl(item.image, "f_auto,q_100,w_200")}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{item.name}</h3>
                        {item.size && (
                          <p className="text-xs text-gray-500">Size: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-xs text-gray-500">Color: {item.color}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 sm:mt-2">
                          <span className="text-sm sm:font-bold text-gray-900">
                            &#8377;{(item.sellingPrice * item.quantity).toFixed(0)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Bundle Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    &#8377;{bundleTotal.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
