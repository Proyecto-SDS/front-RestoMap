'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { api } from '../utils/apiClient';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (
    correo: string,
    contrasena: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    nombre: string,
    correo: string,
    telefono: string,
    contrasena: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (
    nombre: string,
    telefono: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing auth token on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (
    correo: string,
    contrasena: string
  ): Promise<{ success: boolean; error?: string }> => {
    // ========== LÓGICA DEMO USUARIO CLIENTE ==========
    if (correo === 'maria@test.cl' && contrasena === 'test1234') {
      const userData: User = {
        id: 'demo-user-001',
        name: 'Maria Demo',
        email: 'maria@test.cl',
        phone: '9 8765 4321',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', 'demo-token-user');
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }

      setUser(userData);
      setIsLoggedIn(true);

      return { success: true };
    }

    try {
      // Call real API
      const response = await api.login(correo, contrasena);

      if (response.token && response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.nombre,
          email: response.user.correo,
          phone: response.user.telefono,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }

        setUser(userData);
        setIsLoggedIn(true);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Error en el login',
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión. Intenta nuevamente.',
      };
    }
  };

  const register = async (
    nombre: string,
    correo: string,
    telefono: string,
    contrasena: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call real API
      const response = await api.register(nombre, correo, telefono, contrasena);

      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Error al registrar',
        };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Error al crear la cuenta. Intenta nuevamente.',
      };
    }
  };

  const logout = async () => {
    try {
      // Call real API logout
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const updateProfile = async (
    nombre: string,
    telefono: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call real API
      const response = await api.updateProfile(nombre, telefono);

      if (response.success && response.user) {
        const updatedUser: User = {
          id: response.user.id,
          name: response.user.nombre,
          email: response.user.correo,
          phone: response.user.telefono,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }
        setUser(updatedUser);
        return { success: true };
      }

      return {
        success: false,
        error: response.error || 'Error al actualizar perfil',
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar perfil',
      };
    }
  };

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
