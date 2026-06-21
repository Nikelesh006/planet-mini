import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [babyName, setBabyName] = useState('');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already seen the modal
    const hasSeenModal = localStorage.getItem('hasSeenWelcomeModal');
    
    if (!hasSeenModal) {
      // Small delay so it pops up after the initial page render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

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

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill out both fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Success!",
      description: "You've unlocked your discount! Check your email.",
      variant: "success"
    });
    
    handleClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#FBFDF9] rounded-2xl shadow-2xl p-6 sm:p-8 pointer-events-auto overflow-hidden border border-[#B4C49A]/40"
            >
              {/* Sage Green Accents */}
              <div className="absolute top-0 left-0 w-full h-3 bg-[#B4C49A]" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#B4C49A]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#B4C49A]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center mb-6 pt-4 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] mb-3">
                  Get Flat 10% Discount
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-medium px-2 leading-snug">
                  Join the Planet Mini family! Sign up today to unlock an exclusive discount on your first order.
                  <span className="block mt-1 text-xs text-gray-500 font-normal">*Not applicable for sale items or combo deals.</span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#B4C49A]/40 focus:outline-none focus:ring-2 focus:ring-[#B4C49A] text-gray-900 placeholder:text-gray-400 bg-white shadow-sm"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#B4C49A]/40 focus:outline-none focus:ring-2 focus:ring-[#B4C49A] text-gray-900 placeholder:text-gray-400 bg-white shadow-sm"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Your Baby Name"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#B4C49A]/40 focus:outline-none focus:ring-2 focus:ring-[#B4C49A] text-gray-900 placeholder:text-gray-400 bg-white shadow-sm"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-gray-700 text-sm sm:text-base font-semibold block px-1">Your Baby's Birthday</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="DD"
                      maxLength={2}
                      value={dd}
                      onChange={(e) => setDd(e.target.value.replace(/\D/g, ''))}
                      className="w-1/4 px-4 py-3 rounded-xl border border-[#B4C49A]/40 focus:outline-none focus:ring-2 focus:ring-[#B4C49A] text-gray-900 placeholder:text-gray-400 bg-white shadow-sm text-center"
                    />
                    <input
                      type="text"
                      placeholder="MM"
                      maxLength={2}
                      value={mm}
                      onChange={(e) => setMm(e.target.value.replace(/\D/g, ''))}
                      className="w-1/4 px-4 py-3 rounded-xl border border-[#B4C49A]/40 focus:outline-none focus:ring-2 focus:ring-[#B4C49A] text-gray-900 placeholder:text-gray-400 bg-white shadow-sm text-center"
                    />
                    <input
                      type="text"
                      placeholder="YYYY"
                      maxLength={4}
                      value={yyyy}
                      onChange={(e) => setYyyy(e.target.value.replace(/\D/g, ''))}
                      className="w-2/4 px-4 py-3 rounded-xl border border-[#B4C49A]/40 focus:outline-none focus:ring-2 focus:ring-[#B4C49A] text-gray-900 placeholder:text-gray-400 bg-white shadow-sm text-center"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[#B4C49A] text-white font-bold text-lg py-3 rounded-xl hover:bg-[#A3B389] transition-colors shadow-md active:scale-[0.98] mt-4"
                >
                  Submit
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center relative z-10">
                <p className="text-gray-500 text-xs leading-relaxed max-w-[90%] mx-auto font-medium">
                  By signing up, you agree to receive marketing emails. View our privacy policy and terms of service for more info.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
