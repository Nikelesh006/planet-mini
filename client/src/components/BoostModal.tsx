import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Check } from "lucide-react";
import { useState } from "react";
import type { ProductResponse } from "@shared/routes";

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse;
  onSave: (sections: string[]) => Promise<void>;
}

const SECTIONS = [
  { id: "new-arrivals", label: "New Arrivals", description: "Show at top of New Arrivals section" },
  { id: "trending-products", label: "Trending Products", description: "Show at top of Trending Products section" },
];

export function BoostModal({ isOpen, onClose, product, onSave }: BoostModalProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>(
    product.boostSections || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSection = (sectionId: string) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedSections);
      onClose();
    } catch (error) {
      console.error("Error saving boost settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = () => {
    setSelectedSections([]);
  };

  return (
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Boost Product</h2>
                    <p className="text-sm text-gray-500">{product.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Select the sections where you want this product to appear at the top:
                </p>

                <div className="space-y-3">
                  {SECTIONS.map((section) => (
                    <div
                      key={section.id}
                      onClick={() => handleToggleSection(section.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedSections.includes(section.id)
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5 ${
                          selectedSections.includes(section.id)
                            ? 'border-yellow-500 bg-yellow-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedSections.includes(section.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{section.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSections.length === 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">
                      No sections selected. Product will not be boosted.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 p-6 border-t border-gray-200">
                {selectedSections.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                  >
                    Clear All
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Boost'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
