import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface WelcomeMessageProps {
  userName: string;
  onClose: () => void;
}

export default function WelcomeMessage({ userName, onClose }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow exit animation to complete
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.3
          }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl shadow-2xl p-4 border border-white/20 backdrop-blur-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">👋</span>
                  </div>
                  <h3 className="font-bold text-lg">Welcome back!</h3>
                </div>
                <p className="text-black/90 text-sm leading-relaxed">
                  Hello <span className="font-semibold text-black">{userName}</span>! Great to see you. Happy shopping! 🛍️
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
