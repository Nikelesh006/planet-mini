import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const executeWithAuth = useCallback((action: () => void) => {
    if (user) {
      // User is logged in, execute action immediately
      action();
    } else {
      // User not logged in, show auth modal and store the action
      setPendingAction(() => action);
      setShowAuthModal(true);
    }
  }, [user]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    // After successful auth, execute the pending action
    if (pendingAction) {
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 100);
    }
  }, [pendingAction]);

  const handleAuthCancel = useCallback(() => {
    setShowAuthModal(false);
    setPendingAction(null);
  }, []);

  return {
    showAuthModal,
    executeWithAuth,
    handleAuthSuccess,
    handleAuthCancel,
    isUserLoggedIn: !!user
  };
}
