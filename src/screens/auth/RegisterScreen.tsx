'use client';

import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { Toast, useToast } from '../../components/notifications/Toast';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoggedIn } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
    aceptaTerminos: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const validatePhone = (phone: string): boolean => {
    // Chilean phone format: +56912345678 or 912345678
    const phoneRegex = /^(\+?56)?9\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre || formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre es demasiado largo';
    }

    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!validatePhone(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (ej: +56912345678)';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'Mínimo 6 caracteres';
    }

    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Confirma tu contraseña';
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const result = await register(
      formData.nombre,
      formData.correo,
      formData.telefono,
      formData.contrasena
    );
    setIsLoading(false);

    if (result.success) {
      showToast('success', '¡Cuenta creada! Redirigiéndote a login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      showToast('error', result.error || 'Error al crear la cuenta');
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNavigateToLogin = () => {
    router.push('/login');
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
              <h1 className="text-[#334155] mb-2">Crea tu cuenta</h1>
              <p className="text-[#64748B]">
                Únete a RestoMap para descubrir y reservar
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="nombre" className="block mb-1.5 text-[#334155]">
                  Nombre completo
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    size={20}
                  />
                  <input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Juan Pérez"
                    className={`
                      w-full pl-10 pr-3 py-2 border rounded-xl
                      transition-all duration-200
                      focus:outline-none focus:ring-2
                      ${
                        errors.nombre
                          ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                          : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                      }
                    `}
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-1.5 text-sm text-[#EF4444]">
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Email */}
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

              {/* Phone */}
              <div>
                <label
                  htmlFor="telefono"
                  className="block mb-1.5 text-[#334155]"
                >
                  Teléfono
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    size={20}
                  />
                  <input
                    type="tel"
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="+56912345678"
                    className={`
                      w-full pl-10 pr-3 py-2 border rounded-xl
                      transition-all duration-200
                      focus:outline-none focus:ring-2
                      ${
                        errors.telefono
                          ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                          : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                      }
                    `}
                  />
                </div>
                {errors.telefono && (
                  <p className="mt-1.5 text-sm text-[#EF4444]">
                    {errors.telefono}
                  </p>
                )}
              </div>

              {/* Password */}
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmarContrasena"
                  className="block mb-1.5 text-[#334155]"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={(e) =>
                      handleChange('confirmarContrasena', e.target.value)
                    }
                    placeholder="••••••••"
                    className={`
                      w-full pl-10 pr-10 py-2 border rounded-xl
                      transition-all duration-200
                      focus:outline-none focus:ring-2
                      ${
                        errors.confirmarContrasena
                          ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                          : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                      }
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#334155] transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmarContrasena && (
                  <p className="mt-1.5 text-sm text-[#EF4444]">
                    {errors.confirmarContrasena}
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aceptaTerminos}
                    onChange={(e) =>
                      handleChange('aceptaTerminos', e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-[#F97316] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#F97316]/20"
                  />
                  <span className="text-sm text-[#64748B]">
                    Acepto los términos y condiciones
                  </span>
                </label>
                {errors.aceptaTerminos && (
                  <p className="mt-1.5 text-sm text-[#EF4444]">
                    {errors.aceptaTerminos}
                  </p>
                )}
              </div>

              <PrimaryButton
                type="submit"
                className="w-full h-12 mt-6"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </PrimaryButton>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#64748B]">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={handleNavigateToLogin}
                  className="text-[#F97316] hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </div>

          {/* Right: Branding/Hero (Desktop only) */}
          <div className="hidden md:block">
            <div className="text-center">
              <h2 className="text-[#334155] mb-4">Únete a nuestra comunidad</h2>
              <p className="text-[#64748B] mb-6">
                Más de 1,000 usuarios ya disfrutan de la mejor experiencia
                gastronómica en Santiago.
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
