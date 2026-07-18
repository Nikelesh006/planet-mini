import { motion, AnimatePresence } from "framer-motion";
import { X, User } from "lucide-react";
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
          className="fixed top-20 right-4 z-[100] max-w-sm"
        >
          <div className="bg-white text-gray-800 rounded-2xl shadow-xl p-4 border-l-4 border-l-[#B4C49A] border-t border-r border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#F1F5EB] rounded-full flex items-center justify-center border border-[#B4C49A]/30">
                    <User className="w-4 h-4 text-[#B4C49A]" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Welcome back!</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Hello <span className="font-semibold text-gray-900">{userName}</span>! Great to see you. Happy shopping!
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors group"
              >
                <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
