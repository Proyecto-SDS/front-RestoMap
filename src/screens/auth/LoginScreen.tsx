'use client';

import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { Toast, useToast } from '../../components/notifications/Toast';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { login, isLoggedIn, user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the page the user was trying to access
  const from = searchParams?.get('from') || '/';

  // Redirect if already logged in
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

    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'Mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const result = await login(formData.correo, formData.contrasena);
    setIsLoading(false);

    if (result.success) {
      // Get the user name from context (will be set after login)
      const userName = formData.correo.split('@')[0]; // Fallback
      showToast('success', `¡Bienvenido a ReservaYa!`);

      // Short delay to show toast, then navigate
      setTimeout(() => {
        router.replace(from);
      }, 800);
    } else {
      showToast('error', result.error || 'Correo o contraseña incorrectos');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNavigateToRegister = () => {
    router.push('/register');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Volver a inicio</span>
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[900px] grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-[400px] mx-auto">
            {/* Logo/Brand */}
            <div className="mb-6">
              <div className="w-12 h-12 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center mb-4">
                <span className="text-white text-xl">R</span>
              </div>
              <h1 className="text-[#334155] mb-2">Inicia sesión</h1>
              <p className="text-[#64748B]">
                Accede a tu cuenta para reservar y dejar opiniones
              </p>
            </div>

            {/* Demo credentials notice */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Prueba:</strong> maria@test.cl / test123
              </p>
            </div>

            {/* Form */}
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
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
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

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#64748B]">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={handleNavigateToRegister}
                  className="text-[#F97316] hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>

          {/* Right: Branding/Hero (Desktop only) */}
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

      {/* Toast */}
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
