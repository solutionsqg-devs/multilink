'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, type User } from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Cargar usuario actual al montar
   */
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Cargar usuario desde /auth/me
   */
  const loadUser = async () => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      setUser(response.data);
    } catch (error: any) {
      // Si es 401, significa que no hay sesión válida
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login
   */
  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ user: User }>('/auth/login', {
      email,
      password,
    });
    setUser(response.data.user);
    router.push('/dashboard');
  };

  /**
   * Register
   */
  const register = async (email: string, password: string, name?: string) => {
    const response = await apiClient.post<{ user: User }>('/auth/register', {
      email,
      password,
      name,
    });
    setUser(response.data.user);
    router.push('/dashboard');
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignorar errores de logout
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  /**
   * Refrescar usuario (útil después de actualizar perfil)
   */
  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
