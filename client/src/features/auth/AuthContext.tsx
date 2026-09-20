import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../types/index';
import { authApi } from '../../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('knovexa_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem('knovexa_access_token');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('knovexa_access_token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('knovexa_access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
