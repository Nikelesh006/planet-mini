import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type User = {
  id: string;
  sub?: string;
  email: string;
  name?: string;
  image?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
  logout: () => void;
  showWelcomeMessage: boolean;
  dismissWelcomeMessage: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetch: () => {},
  logout: () => {},
  showWelcomeMessage: false,
  dismissWelcomeMessage: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [previousUser, setPreviousUser] = useState<User | null>(null);

  const fetchSession = async () => {
    try {
      console.log('🔍 AuthContext - Fetching session...');
      const res = await fetch("/api/auth/session", {
        credentials: "include",
      });
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
      }
    } catch (error) {
      console.error('❌ AuthContext - Session fetch error:', error);
      setUser(null);
      setPreviousUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    setIsLoading(true);
    fetchSession();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setPreviousUser(null);
      // Clear welcome flags on logout
      localStorage.removeItem('hasSeenWelcome');
      localStorage.removeItem('lastSeenUserId');
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setPreviousUser(null);
      localStorage.removeItem('hasSeenWelcome');
      localStorage.removeItem('lastSeenUserId');
    }
  };

  const dismissWelcomeMessage = () => {
    setShowWelcomeMessage(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch, logout, showWelcomeMessage, dismissWelcomeMessage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
