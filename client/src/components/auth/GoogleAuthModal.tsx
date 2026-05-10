'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function GoogleAuthModal({ isOpen, onClose, initialMode = 'signin' }: GoogleAuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3
              }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clean modern card */}
              <div className="relative overflow-hidden rounded-2xl bg-[#FBFDF9] shadow-xl border border-[#B4C49A]/40">
                {/* Sage Green Accents */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[#B4C49A]" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#B4C49A]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#B4C49A]/10 rounded-full blur-3xl" />
                
                {/* Content */}
                <div className="relative z-10 p-6 sm:p-8">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors group"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>

                  {/* Header */}
                  <div className="text-center mb-8">
                    {/* Planet Mini Logo */}
                    <div className="mx-auto w-32 h-32 mb-5 p-2 bg-white rounded-2xl shadow-sm border border-[#B4C49A]/20">
                      <img
                        src="/Planet-mini-logo.png"
                        alt="Planet Mini Logo"
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1D3557] mb-2">
                      {mode === 'signin' ? 'Welcome Back' : 'Join Planet Mini'}
                    </h2>
                    <p className="text-[#4A5568] text-sm">
                      {mode === 'signin' 
                        ? 'Sign in to access your profile, orders & wishlist'
                        : 'Create your account to start shopping and save your favorites'
                      }
                    </p>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex bg-[#F1F5EB] rounded-xl p-1 mb-6">
                    <button
                      onClick={() => setMode('signin')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                        mode === 'signin'
                          ? 'bg-white text-[#1D3557] shadow-sm'
                          : 'text-[#4A5568] hover:text-[#1D3557]'
                      }`}
                    >
                      <LogIn className={`w-4 h-4 ${mode === 'signin' ? 'text-[#B4C49A]' : ''}`} />
                      Sign In
                    </button>
                    <button
                      onClick={() => setMode('signup')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                        mode === 'signup'
                          ? 'bg-white text-[#1D3557] shadow-sm'
                          : 'text-[#4A5568] hover:text-[#1D3557]'
                      }`}
                    >
                      <UserPlus className={`w-4 h-4 ${mode === 'signup' ? 'text-[#B4C49A]' : ''}`} />
                      Sign Up
                    </button>
                  </div>

                  {/* Google Auth Button */}
                  <button
                    onClick={handleGoogleAuth}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-[#B4C49A]/30 rounded-xl hover:bg-[#F1F5EB] hover:border-[#B4C49A] transition-all duration-200 shadow-sm"
                  >
                    {/* Google Logo */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    
                    <span className="text-gray-700 font-medium text-base">
                      Continue with Google
                    </span>
                  </button>

                  {/* Helper Text */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      {mode === 'signin' 
                        ? "New to Planet Mini? "
                        : "Already have an account? "
                      }
                      <button
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-[#1D3557] hover:text-[#B4C49A] font-medium ml-1 transition-colors"
                      >
                        {mode === 'signin' ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
