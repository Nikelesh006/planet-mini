import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../lib/api';

type User = {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await apiFetch("/api/auth/session");
      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data.user || null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    setIsLoading(true);
    fetchSession();
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
