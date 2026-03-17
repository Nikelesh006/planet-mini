import { useState, useCallback } from 'react';

export function useAuthModal() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openSignInModal = useCallback(() => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  }, []);

  const openSignUpModal = useCallback(() => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  }, []);

  return {
    isAuthModalOpen,
    authMode,
    openAuthModal,
    openSignInModal,
    openSignUpModal,
    closeAuthModal
  };
}
