import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, userId: number) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        apiService.setToken(token);
        // We'll extract userId from JWT in a real app, but for now we'll decode it manually
        // or let the backend /users/me endpoint handle it.
        // For simplicity, we just use the ID we get when logging in.
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const response = await apiService.getUser(parseInt(userId));
            setUser(response.data);
          } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
          }
        } else {
            logout();
        }
      } else {
        apiService.setToken(null);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (newToken: string, userId: number) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', userId.toString());
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
    apiService.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
