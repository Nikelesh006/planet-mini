import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { isUserAdminAuthorized } from '../lib/admin-auth';

type User = {
  id: string;
  sub?: string;
  email: string;
  name?: string;
  image?: string;
  picture?: string;
  role?: string;
  isAdmin?: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
  logout: () => void;
  showWelcomeMessage: boolean;
  dismissWelcomeMessage: () => void;
  isAdminPinVerified: boolean;
  adminPinRemainingSeconds: number;
  isPinModalOpen: boolean;
  setIsPinModalOpen: (open: boolean) => void;
  verifyAdminPin: (pin: string) => Promise<{
    success: boolean;
    error?: string;
    remainingAttempts?: number;
    lockedOut?: boolean;
  }>;
  checkAdminPinStatus: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetch: () => {},
  logout: () => {},
  showWelcomeMessage: false,
  dismissWelcomeMessage: () => {},
  isAdminPinVerified: false,
  adminPinRemainingSeconds: 0,
  isPinModalOpen: false,
  setIsPinModalOpen: () => {},
  verifyAdminPin: async () => ({ success: false }),
  checkAdminPinStatus: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [previousUser, setPreviousUser] = useState<User | null>(null);
  const [isAdminPinVerified, setIsAdminPinVerified] = useState(false);
  const [adminPinRemainingSeconds, setAdminPinRemainingSeconds] = useState(0);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const fetchSession = async () => {
    try {
      console.log('🔍 AuthContext - Fetching session...');
      
      // Check if there is a JWT token in the URL query string (redirected from Google OAuth callback)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        console.log('🔑 Found JWT token in URL query parameter! Saving to localStorage...');
        localStorage.setItem('jwtToken', urlToken);
        
        // Scrub token from URL address bar for clean UX
        params.delete('token');
        const cleanQuery = params.toString() ? '?' + params.toString() : '';
        window.history.replaceState({}, '', window.location.pathname + cleanQuery);
      }

      const res = await apiFetch("/api/auth/session");
      if (!res.ok) {
        console.log('❌ AuthContext - Session fetch failed:', res.status);
        setUser(null);
        setPreviousUser(null);
      } else {
        const data = await res.json();
        const currentUser = data.user || null;
        
        console.log('✅ AuthContext - Session data:', currentUser);
        
        // Store user in localStorage for addressApi to access
        if (currentUser) {
          localStorage.setItem('authUser', JSON.stringify(currentUser));
          console.log('✅ AuthContext - Stored user in localStorage:', currentUser);
        } else {
          localStorage.removeItem('authUser');
          console.log('🗑️ AuthContext - Removed user from localStorage');
        }
        
        // Check if user just logged in (was null, now has user)
        // Only show welcome if this is a new login session
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        const userId = currentUser?.id;
        const lastSeenUserId = localStorage.getItem('lastSeenUserId');
        
        if (!previousUser && currentUser && currentUser.name && (!hasSeenWelcome || lastSeenUserId !== userId)) {
          setShowWelcomeMessage(true);
          localStorage.setItem('hasSeenWelcome', 'true');
          localStorage.setItem('lastSeenUserId', userId || '');
        }
        
        setUser(currentUser);
        setPreviousUser(currentUser);

        // If user is an authorized admin, synchronize PIN verification status
        if (currentUser && (currentUser.isAdmin || currentUser.role === 'admin' || isUserAdminAuthorized(currentUser))) {
          checkAdminPinStatus();
        } else {
          setIsAdminPinVerified(false);
          setAdminPinRemainingSeconds(0);
        }
      }
    } catch (error) {
      console.error('❌ AuthContext - Session fetch error:', error);
      setUser(null);
      setPreviousUser(null);
      setIsAdminPinVerified(false);
      setAdminPinRemainingSeconds(0);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminPinStatus = async (): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/admin/security/status');
      if (!res.ok) {
        setIsAdminPinVerified(false);
        setAdminPinRemainingSeconds(0);
        return false;
      }
      const data = await res.json();
      const verified = Boolean(data.isPinVerified);
      setIsAdminPinVerified(verified);
      setAdminPinRemainingSeconds(data.remainingSeconds || 0);
      return verified;
    } catch {
      setIsAdminPinVerified(false);
      setAdminPinRemainingSeconds(0);
      return false;
    }
  };

  const verifyAdminPin = async (pin: string) => {
    try {
      const res = await apiFetch('/api/admin/security/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setIsAdminPinVerified(true);
        setAdminPinRemainingSeconds((data.expiresInMinutes || 15) * 60);
        return { success: true };
      }
      return {
        success: false,
        error: data.error || 'Incorrect Admin PIN.',
        remainingAttempts: data.remainingAttempts,
        lockedOut: data.lockedOut,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error during PIN verification.',
      };
    }
  };

  const refetch = () => {
    setIsLoading(true);
    fetchSession();
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      setPreviousUser(null);
      setIsAdminPinVerified(false);
      setAdminPinRemainingSeconds(0);
      setIsPinModalOpen(false);
      // Clear welcome flags and token on logout
      localStorage.removeItem('hasSeenWelcome');
      localStorage.removeItem('lastSeenUserId');
      localStorage.removeItem('jwtToken');
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setPreviousUser(null);
      setIsAdminPinVerified(false);
      setAdminPinRemainingSeconds(0);
      setIsPinModalOpen(false);
      localStorage.removeItem('hasSeenWelcome');
      localStorage.removeItem('lastSeenUserId');
      localStorage.removeItem('jwtToken');
    }
  };

  const dismissWelcomeMessage = () => {
    setShowWelcomeMessage(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        refetch,
        logout,
        showWelcomeMessage,
        dismissWelcomeMessage,
        isAdminPinVerified,
        adminPinRemainingSeconds,
        isPinModalOpen,
        setIsPinModalOpen,
        verifyAdminPin,
        checkAdminPinStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
