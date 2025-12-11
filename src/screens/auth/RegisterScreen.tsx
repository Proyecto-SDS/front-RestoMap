'use client';

import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { TermsModal } from '../../components/modals/TermsModal';

import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoggedIn } = useAuth();

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
  const [showTermsModal, setShowTermsModal] = useState(false);

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
    // Chilean phone format: 9 dígitos empezando con 9
    return /^9\d{8}$/.test(phone);
  };

  const validatePassword = (
    password: string
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!/[A-Z]/.test(password)) {
      errors.push('una mayuscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('una minuscula');
    }
    if (!/\d/.test(password)) {
      errors.push('un numero');
    }
    return { valid: errors.length === 0, errors };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre || formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (formData.correo.length > 75) {
      newErrors.correo = 'El correo no puede exceder 75 caracteres';
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = 'Correo invalido';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El telefono es requerido';
    } else if (!validatePhone(formData.telefono)) {
      newErrors.telefono = 'Telefono invalido (9 digitos, ej: 912345678)';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contrasena es requerida';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'Minimo 6 caracteres';
    } else {
      const passwordValidation = validatePassword(formData.contrasena);
      if (!passwordValidation.valid) {
        newErrors.contrasena = `Debe contener: ${passwordValidation.errors.join(
          ', '
        )}`;
      }
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
      // Redirigir al login tras creación exitosa
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } else {
      setErrors({ general: result.error || 'Error al crear la cuenta' });
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    // Aplicar límites según el campo
    let processedValue = value;

    if (typeof value === 'string') {
      switch (field) {
        case 'nombre':
          processedValue = value.slice(0, 50);
          break;
        case 'correo':
          processedValue = value.slice(0, 75);
          break;
        case 'telefono':
          // Solo permitir números, máximo 9 dígitos
          processedValue = value.replace(/\D/g, '').slice(0, 9);
          break;
        case 'contrasena':
        case 'confirmarContrasena':
          processedValue = value.slice(0, 50);
          break;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
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
                  Nombre completo{' '}
                  <span className="text-xs text-[#94A3B8]">
                    ({formData.nombre.length}/50)
                  </span>
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
                    placeholder="Juan Perez"
                    maxLength={50}
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
                  Correo electronico{' '}
                  <span className="text-xs text-[#94A3B8]">
                    ({formData.correo.length}/75)
                  </span>
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
                    maxLength={75}
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
                  Telefono{' '}
                  <span className="text-xs text-[#94A3B8]">
                    ({formData.telefono.length}/9)
                  </span>
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
                    placeholder="912345678"
                    maxLength={9}
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
                  Contrasena{' '}
                  <span className="text-xs text-[#94A3B8]">
                    ({formData.contrasena.length}/50)
                  </span>
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
                    placeholder="Min 6 caracteres"
                    maxLength={50}
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
                      showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Password requirements indicator */}
                <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                  <span
                    className={
                      /[A-Z]/.test(formData.contrasena)
                        ? 'text-[#22C55E]'
                        : 'text-[#94A3B8]'
                    }
                  >
                    1 mayuscula
                  </span>
                  <span
                    className={
                      /[a-z]/.test(formData.contrasena)
                        ? 'text-[#22C55E]'
                        : 'text-[#94A3B8]'
                    }
                  >
                    1 minuscula
                  </span>
                  <span
                    className={
                      /\d/.test(formData.contrasena)
                        ? 'text-[#22C55E]'
                        : 'text-[#94A3B8]'
                    }
                  >
                    1 numero
                  </span>
                  <span
                    className={
                      formData.contrasena.length >= 6
                        ? 'text-[#22C55E]'
                        : 'text-[#94A3B8]'
                    }
                  >
                    6+ caracteres
                  </span>
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
                  Confirmar contrasena{' '}
                  <span className="text-xs text-[#94A3B8]">
                    ({formData.confirmarContrasena.length}/50)
                  </span>
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
                    placeholder="Repite tu contrasena"
                    maxLength={50}
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
                        ? 'Ocultar contrasena'
                        : 'Mostrar contrasena'
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
                    Acepto los{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#F97316] hover:underline"
                    >
                      términos y condiciones
                    </button>
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

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="persona"
      />
    </div>
  );
}
