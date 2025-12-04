'use client';

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Star,
  User,
} from 'lucide-react';
import Image from 'next/image';
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
  const [activeTab, setActiveTab] = useState<'persona' | 'empresa'>('persona');

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
    const result = await login(formData.correo, formData.contrasena, activeTab);
    setIsLoading(false);

    if (result.success) {
      showToast('success', `¡Bienvenido a RestoMap!`);
      setTimeout(() => {
        router.replace(from);
      }, 800);
    } else {
      showToast('error', result.error || 'Correo o contraseña incorrectos');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleTabChange = (tab: 'persona' | 'empresa') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Hero Section */}
      <div className="relative bg-linear-to-br from-orange-100 via-rose-100 to-pink-100 p-8 lg:p-12 flex flex-col justify-between overflow-hidden">
        {/* Decorative blurred gradients */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-linear-to-b from-[#F97316] to-[#EF4444] rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-linear-to-b from-[#F97316] to-[#EF4444] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo and Location */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2">
              <Image
                src="/logo.png"
                alt="RestoMap Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#334155]">
                RestoMap
              </h2>
              <p className="text-xs text-[#64748B] uppercase tracking-wide">
                Santiago, Chile
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-semibold text-[#334155] mb-4 leading-tight">
              Tu mesa perfecta te está esperando
            </h1>
            <p className="text-base text-[#64748B] leading-relaxed">
              Conecta con los mejores restaurantes, restobares y bares de
              Santiago. Reserva en segundos y disfruta experiencias
              gastronómicas inolvidables.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-12">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-[#F97316]" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-[#334155] mb-1">
                  Reservas instantáneas
                </h3>
                <p className="text-sm text-[#64748B]">
                  Confirma tu mesa en tiempo real sin esperas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="text-[#F97316]" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-[#334155] mb-1">
                  Descubre lugares únicos
                </h3>
                <p className="text-sm text-[#64748B]">
                  Explora opciones cerca de ti con mapas interactivos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shrink-0">
                <Star className="text-[#F97316]" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-[#334155] mb-1">
                  Opiniones verificadas
                </h3>
                <p className="text-sm text-[#64748B]">
                  Lee reseñas reales de otros comensales
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-[#334155]">500+</div>
            <div className="text-xs text-[#64748B] uppercase tracking-wide">
              Locales
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#334155]">15K+</div>
            <div className="text-xs text-[#64748B] uppercase tracking-wide">
              Usuarios
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-3xl font-bold text-[#334155]">4.8</div>
            <Star className="text-[#F97316] fill-[#F97316]" size={20} />
            <div className="text-xs text-[#64748B] uppercase tracking-wide ml-1">
              Rating
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="relative bg-white p-8 lg:p-12 flex items-center justify-center">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-[#64748B] transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            <span>Volver a inicio</span>
          </button>
        </div>

        <div className="w-full max-w-md">
          {/* Tab Selection Header */}
          <div className="text-center mb-6">
            <p className="text-sm text-[#64748B] mb-4">
              Selecciona cómo quieres iniciar sesión
            </p>
            <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => handleTabChange('persona')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === 'persona'
                    ? 'bg-white shadow-sm text-[#F97316] font-medium'
                    : 'text-[#64748B] hover:text-[#334155]'
                }`}
              >
                <User size={18} />
                <span>Persona</span>
              </button>
              <button
                onClick={() => handleTabChange('empresa')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === 'empresa'
                    ? 'bg-white shadow-sm text-[#F97316] font-medium'
                    : 'text-[#64748B] hover:text-[#334155]'
                }`}
              >
                <Building2 size={18} />
                <span>Empresa</span>
              </button>
            </div>
          </div>

          {/* Form Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-[#334155] mb-2">
              Inicia sesión
            </h1>
            <p className="text-[#64748B]">
              Accede a tu cuenta para reservar y dejar opiniones
            </p>
          </div>

          {/* Demo Credentials Banner */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {activeTab === 'persona' && (
              <>
                <p className="text-sm text-blue-800">
                  <strong>Demo Persona (Juan Pérez):</strong> juan@test.cl /
                  test123
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Demo Persona (Maria Gonzalez):</strong> maria@test.cl
                  / test123
                </p>
              </>
            )}
            {activeTab === 'empresa' && (
              <>
                <p className="text-sm text-blue-800">
                  <strong>Demo Empresa (Mesero):</strong> mesero@test.cl /
                  test123
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Demo Empresa (Chef):</strong> chef@test.cl / test123
                </p>
              </>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="correo"
                className="block mb-2 text-sm font-medium text-[#334155]"
              >
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
                    w-full pl-11 pr-4 py-3 border rounded-xl
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
                <p className="mt-2 text-sm text-[#EF4444]">{errors.correo}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="contrasena"
                className="block mb-2 text-sm font-medium text-[#334155]"
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
                    w-full pl-11 pr-11 py-3 border rounded-xl
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
                <p className="mt-2 text-sm text-[#EF4444]">
                  {errors.contrasena}
                </p>
              )}
            </div>

            <PrimaryButton
              type="submit"
              className="w-full h-12 mt-2"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Inicia sesión'}
            </PrimaryButton>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748B]">
              ¿No tienes cuenta?{' '}
              <button
                onClick={handleNavigateToRegister}
                className="text-[#F97316] hover:underline font-medium"
              >
                Regístrate aquí
              </button>
            </p>
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
