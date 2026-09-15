'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AdminPinModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  const { isPinModalOpen, setIsPinModalOpen, verifyAdminPin } = useAuth();
  const { toast } = useToast();
  const effectiveIsOpen = isOpen !== undefined ? isOpen : isPinModalOpen;

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lockedOut, setLockedOut] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleClose = () => {
    setDigits(['', '', '', '', '', '']);
    setErrorMessage('');
    setIsSubmitting(false);
    if (onClose) onClose();
    setIsPinModalOpen(false);
  };

  useEffect(() => {
    if (effectiveIsOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setIsSubmitting(false);

      // Auto-focus first digit on open
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [effectiveIsOpen]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric characters
    const numericVal = value.replace(/\D/g, '');
    if (!numericVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single digit entry
    const char = numericVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage('');

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // All 6 digits filled -> auto-submit
      const fullPin = newDigits.join('');
      if (fullPin.length === 6) {
        submitPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setErrorMessage('');

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      submitPin(pasted);
    }
  };

  const submitPin = async (pinToSubmit: string) => {
    if (pinToSubmit.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await verifyAdminPin(pinToSubmit);
      if (result.success) {
        handleClose();
        toast({
          title: "Admin Access Granted",
          description: "Admin panel is now unlocked and available in the navbar.",
          variant: "success",
        });
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.error || 'Verification failed. Please try again.');
        setLockedOut(Boolean(result.lockedOut));
        // Clear input boxes for retry
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 50);
      }
    } catch {
      setErrorMessage('Network error during verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = digits.join('');
    submitPin(fullPin);
  };

  return (
    <AnimatePresence>
      {effectiveIsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#B4C49A]/30 overflow-hidden relative"
          >
            {/* Top decorative accent */}
            <div className="h-2 bg-gradient-to-r from-[#9CB082] via-[#B4C49A] to-[#8FA474]" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Close"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 text-center">
              {/* Shield Icon */}
              <div className="w-16 h-16 bg-[#B4C49A]/15 border border-[#B4C49A]/40 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#6B8050] shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                Admin Password / PIN
              </h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Enter your <span className="font-semibold text-gray-900">6-digit Admin password / PIN</span> to unlock the admin panel.
              </p>

              {/* Error banner */}
              {errorMessage && (
                <div
                  className={`mb-6 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 text-left transition-all ${
                    lockedOut
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 mb-6">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={idx === 0 ? handlePaste : undefined}
                      disabled={isSubmitting || lockedOut}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border border-gray-300 focus:border-[#9CB082] focus:ring-2 focus:ring-[#B4C49A]/30 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 shadow-sm"
                      autoComplete="off"
                    />
                  ))}
                </div>

                {/* Show/Hide PIN toggle */}
                <div className="flex justify-center mb-6">
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPin ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide PIN</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show PIN</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || digits.join('').length !== 6 || lockedOut}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#B4C49A] hover:bg-[#a3b587] text-gray-900 font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Verify & Unlock</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security notice footer */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center text-xs text-gray-400">
                <span>Planet Mini Admin Security Layer</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
