import { useState, useCallback } from 'react';

export function useAuthModal() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => {
    console.log('🔓 useAuthModal: Opening modal');
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    console.log('🔒 useAuthModal: Closing modal');
    setIsAuthModalOpen(false);
  }, []);

  return {
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal
  };
}
