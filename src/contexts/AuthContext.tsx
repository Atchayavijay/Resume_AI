'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refresh = useCallback(async () => {
    try {
      // First, try to get user info with current token
      let res = await fetch('/api/auth/me', { credentials: 'include' });

      // If unauthorized, try to refresh the token first
      if (res.status === 401) {
        console.log('Access token expired, refreshing...');
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          console.log('Token refreshed, retrying /me...');
          // Retry getting user info with the new token
          res = await fetch('/api/auth/me', { credentials: 'include' });
        } else {
          console.log('Token refresh failed');
          setUser(null);
          setLoading(false);
          setInitialized(true);
          return;
        }
      }

      // Process the response
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: data.error || 'Login failed' };
        }
        setUser(data.user);
        return {};
      } catch (e) {
        return { error: 'Network error' };
      }
    },
    []
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string
    ): Promise<{ error?: string }> => {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: data.error || 'Signup failed' };
        }
        return {};
      } catch (e) {
        return { error: 'Network error' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    login,
    signup,
    logout,
    refresh,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
