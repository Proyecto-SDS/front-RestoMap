'use client';

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { Toast, useToast } from '../../components/notifications/Toast';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = searchParams?.get('from') || '/';

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.correo) newErrors.correo = 'El correo es requerido';
    else if (!validateEmail(formData.correo))
      newErrors.correo = 'Correo inválido';
    if (!formData.contrasena)
      newErrors.contrasena = 'La contraseña es requerida';
    else if (formData.contrasena.length < 6)
      newErrors.contrasena = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para rellenar los datos al hacer clic en los botones demo
  const fillCredentials = (email: string, pass: string) => {
    setFormData({ correo: email, contrasena: pass });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. INTERCEPTOR DE ADMIN
    if (formData.correo === 'admin@reservaya.cl') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        showToast('success', '¡Bienvenido Administrador!');
        window.location.href = '/admin'; // Redirección forzada segura
      }, 1000);
      return;
    }

    // 2. LOGIN DE USUARIO
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await login(formData.correo, formData.contrasena);
    setIsLoading(false);

    if (result.success) {
      // El nombre se obtendrá del contexto tras la recarga
      showToast('success', `¡Bienvenido a ReservaYa!`);
      setTimeout(() => {
        // Usamos window.location para asegurar que el Header se actualice
        window.location.href = from;
      }, 800);
    } else {
      showToast('error', result.error || 'Correo o contraseña incorrectos');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Botón Volver */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Volver a inicio</span>
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[900px] grid md:grid-cols-2 gap-8 items-center">
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-[400px] mx-auto">
            {/* Header del Formulario */}
            <div className="mb-6">
              <div className="w-12 h-12 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center mb-4">
                <span className="text-white text-xl">R</span>
              </div>
              <h1 className="text-[#334155] mb-2">Inicia sesión</h1>
              <p className="text-[#64748B]">
                Accede a tu cuenta para reservar y dejar opiniones
              </p>
            </div>

            {/* --- AQUÍ ESTÁ EL BLOQUE DE LA IMAGEN --- */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Credenciales Demo
              </p>

              {/* Botón Usuario Cliente */}
              <div
                onClick={() => fillCredentials('maria@test.cl', 'test1234')}
                className="flex items-center gap-3 p-2 bg-white/60 rounded-lg cursor-pointer hover:bg-white transition-colors border border-transparent hover:border-blue-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Usuario Cliente
                  </p>
                  <p className="text-xs text-blue-600">maria@test.cl</p>
                </div>
              </div>

              {/* Botón Administrador */}
              <div
                onClick={() =>
                  fillCredentials('admin@reservaya.cl', 'admin123')
                }
                className="flex items-center gap-3 p-2 bg-white/60 rounded-lg cursor-pointer hover:bg-white transition-colors border border-transparent hover:border-orange-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Administrador
                  </p>
                  <p className="text-xs text-orange-600">admin@reservaya.cl</p>
                </div>
              </div>
            </div>
            {/* ---------------------------------------- */}

            {/* Inputs del Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="correo" className="block mb-1.5 text-[#334155]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    size={20}
                  />
                  <input
                    type="email"
                    id="correo"
                    value={formData.correo}
                    onChange={(e) => handleChange('correo', e.target.value)}
                    placeholder="tu@ejemplo.com"
                    className={`
                      w-full pl-10 pr-3 py-2 border rounded-xl
                      transition-all duration-200
                      focus:outline-none focus:ring-2
                      ${
                        errors.correo
                          ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                          : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                      }
                    `}
                  />
                </div>
                {errors.correo && (
                  <p className="mt-1.5 text-sm text-[#EF4444]">
                    {errors.correo}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contrasena"
                  className="block mb-1.5 text-[#334155]"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    size={20}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    value={formData.contrasena}
                    onChange={(e) => handleChange('contrasena', e.target.value)}
                    placeholder="••••••••"
                    className={`
                      w-full pl-10 pr-10 py-2 border rounded-xl
                      transition-all duration-200
                      focus:outline-none focus:ring-2
                      ${
                        errors.contrasena
                          ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                          : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                      }
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#334155] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.contrasena && (
                  <p className="mt-1.5 text-sm text-[#EF4444]">
                    {errors.contrasena}
                  </p>
                )}
              </div>

              <PrimaryButton
                type="submit"
                className="w-full h-12 mt-6"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Inicia sesión'}
              </PrimaryButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#64748B]">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-[#F97316] hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: IMAGEN (Tal cual tu diseño original) */}
          <div className="hidden md:block">
            <div className="text-center">
              <h2 className="text-[#334155] mb-4">
                Descubre los mejores restaurantes
              </h2>
              <p className="text-[#64748B] mb-6">
                Reserva mesas, explora menús y comparte tu experiencia con otros
                comensales.
              </p>
              <div className="w-full h-64 bg-linear-to-br from-[#F97316]/10 to-[#EF4444]/10 rounded-2xl flex items-center justify-center">
                <div className="w-32 h-32 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
