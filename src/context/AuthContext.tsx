'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Empleado, EmpleadoRol, Empresa, User, UserType } from '../types';
import { api } from '../utils/apiClient';

interface AuthContextType {
  user: User | null;
  userType: UserType;
  empresa: Empresa | null;
  empleado: Empleado | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (
    correo: string,
    contrasena: string,
    tipo?: UserType
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
  const [userType, setUserType] = useState<UserType>('persona');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
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
    const storedUserType = localStorage.getItem('auth_user_type') as UserType;
    const storedEmpresa = localStorage.getItem('auth_empresa');
    const storedEmpleado = localStorage.getItem('auth_empleado');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUserType(storedUserType || 'persona');
        setIsLoggedIn(true);

        if (storedEmpresa) {
          setEmpresa(JSON.parse(storedEmpresa));
        }
        if (storedEmpleado) {
          setEmpleado(JSON.parse(storedEmpleado));
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_user_type');
        localStorage.removeItem('auth_empresa');
        localStorage.removeItem('auth_empleado');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (
    correo: string,
    contrasena: string,
    tipo: UserType = 'persona'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock login for empresa/empleado
      if (tipo === 'empresa') {
        // Simular respuesta del backend para login de empleado
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock: validar credenciales (en producción esto viene del backend)
        if (correo === 'admin@restomap.cl' && contrasena === 'admin123') {
          const mockEmpresa: Empresa = {
            id: 'emp-1',
            nombre: 'RestoMap Central',
            correo: 'contacto@restomap.cl',
            telefono: '+56912345678',
            direccion: 'Av. Providencia 1234, Santiago',
            tipo: 'Restaurante',
          };

          const mockEmpleado: Empleado = {
            id: 'empleado-1',
            id_empresa: 'emp-1',
            nombre: 'Admin Principal',
            correo: correo,
            telefono: '+56912345678',
            rol: 'admin',
            estado: 'activo',
            creado_el: new Date().toISOString(),
          };

          const mockUser: User = {
            id: 'empleado-1',
            name: 'Admin Principal',
            email: correo,
            phone: '+56912345678',
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', 'mock-token-empresa-admin');
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
            localStorage.setItem('auth_user_type', tipo);
            localStorage.setItem('auth_empresa', JSON.stringify(mockEmpresa));
            localStorage.setItem('auth_empleado', JSON.stringify(mockEmpleado));
          }

          setUser(mockUser);
          setUserType(tipo);
          setEmpresa(mockEmpresa);
          setEmpleado(mockEmpleado);
          setIsLoggedIn(true);

          return { success: true };
        }

        // Otros roles de empleados mock
        const empleadosDemo: Record<string, { rol: EmpleadoRol; nombre: string }> = {
          'cocinero@restomap.cl': { rol: 'cocinero', nombre: 'Carlos Chef' },
          'mesero@restomap.cl': { rol: 'mesero', nombre: 'María Mesera' },
          'bartender@restomap.cl': { rol: 'bartender', nombre: 'Juan Bartender' },
        };

        if (empleadosDemo[correo] && contrasena === 'demo123') {
          const empleadoData = empleadosDemo[correo];
          const mockEmpresa: Empresa = {
            id: 'emp-1',
            nombre: 'RestoMap Central',
            correo: 'contacto@restomap.cl',
            telefono: '+56912345678',
            tipo: 'Restaurante',
          };

          const mockEmpleado: Empleado = {
            id: `empleado-${empleadoData.rol}`,
            id_empresa: 'emp-1',
            nombre: empleadoData.nombre,
            correo: correo,
            rol: empleadoData.rol,
            estado: 'activo',
            creado_el: new Date().toISOString(),
          };

          const mockUser: User = {
            id: `empleado-${empleadoData.rol}`,
            name: empleadoData.nombre,
            email: correo,
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', `mock-token-${empleadoData.rol}`);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
            localStorage.setItem('auth_user_type', tipo);
            localStorage.setItem('auth_empresa', JSON.stringify(mockEmpresa));
            localStorage.setItem('auth_empleado', JSON.stringify(mockEmpleado));
          }

          setUser(mockUser);
          setUserType(tipo);
          setEmpresa(mockEmpresa);
          setEmpleado(mockEmpleado);
          setIsLoggedIn(true);

          return { success: true };
        }

        return {
          success: false,
          error: 'Credenciales de empleado incorrectas',
        };
      }

      // Call real API for persona login
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
          localStorage.setItem('auth_user_type', tipo);
        }

        setUser(userData);
        setUserType(tipo);
        setIsLoggedIn(true);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Error en el login',
        };
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión. Intenta nuevamente.',
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
    } catch (error: unknown) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear la cuenta. Intenta nuevamente.',
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
        localStorage.removeItem('auth_user_type');
        localStorage.removeItem('auth_empresa');
        localStorage.removeItem('auth_empleado');
      }
      setUser(null);
      setUserType('persona');
      setEmpresa(null);
      setEmpleado(null);
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
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar perfil',
      };
    }
  };

  const value = {
    user,
    userType,
    empresa,
    empleado,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
