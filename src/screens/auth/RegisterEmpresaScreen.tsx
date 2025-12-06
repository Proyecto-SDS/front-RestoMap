'use client';

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  FileCheck,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { TermsModal } from '../../components/modals/TermsModal';
import { Toast, useToast } from '../../components/notifications/Toast';
import { api } from '../../utils/apiClient';

// Tipos de local (basados en catalogs.py del backend)
const TIPOS_LOCAL = [
  { id: 1, nombre: 'Restaurante' },
  { id: 2, nombre: 'Bar' },
  { id: 3, nombre: 'Restobar' },
];

interface FormData {
  // Paso 1: RUT
  rut_empresa: string;
  razon_social: string;
  glosa_giro: string;
  // Paso 2: Local
  nombre_local: string;
  telefono_local: string;
  correo_local: string;
  descripcion: string;
  id_tipo_local: number;
  calle: string;
  numero: string;
  id_comuna: number;
  // Paso 3: Gerente
  nombre_gerente: string;
  correo_gerente: string;
  telefono_gerente: string;
  contrasena: string;
  confirmar_contrasena: string;
  acepta_terminos: boolean;
}

const initialFormData: FormData = {
  rut_empresa: '',
  razon_social: '',
  glosa_giro: '',
  nombre_local: '',
  telefono_local: '',
  correo_local: '',
  descripcion: '',
  id_tipo_local: 1,
  calle: '',
  numero: '',
  id_comuna: 1,
  nombre_gerente: '',
  correo_gerente: '',
  telefono_gerente: '',
  contrasena: '',
  confirmar_contrasena: '',
  acepta_terminos: false,
};

export default function RegisterEmpresaScreen() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidatingRut, setIsValidatingRut] = useState(false);
  const [rutValidated, setRutValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (
    field: keyof FormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Reset RUT validation if RUT changes
    if (field === 'rut_empresa') {
      setRutValidated(false);
      setFormData((prev) => ({ ...prev, razon_social: '', glosa_giro: '' }));
    }
  };

  const formatRut = (value: string): string => {
    // Remove non-alphanumeric characters
    let rut = value.replace(/[^0-9kK]/g, '').toUpperCase();

    if (rut.length > 1) {
      // Add dash before last character (DV)
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
    }
    if (rut.length > 5) {
      // Add dots for thousands
      rut = rut.replace(/^(\d{1,2})(\d{3})/, '$1.$2');
    }
    if (rut.length > 9) {
      rut = rut.replace(/^(\d{1,2})\.(\d{3})(\d{3})/, '$1.$2.$3');
    }

    return rut;
  };

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    handleChange('rut_empresa', formatted);
  };

  const validateRut = async () => {
    if (!formData.rut_empresa || formData.rut_empresa.length < 9) {
      setErrors({ rut_empresa: 'Ingresa un RUT valido' });
      return;
    }

    setIsValidatingRut(true);
    setErrors({});

    try {
      const result = await api.validarRut(formData.rut_empresa);

      if (result.valido && result.existe) {
        setFormData((prev) => ({
          ...prev,
          razon_social: result.razon_social || '',
          glosa_giro: result.glosa_giro || '',
        }));
        setRutValidated(true);
        showToast('success', 'RUT validado correctamente');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al validar RUT';
      setErrors({ rut_empresa: errorMessage });
      showToast('error', errorMessage);
    } finally {
      setIsValidatingRut(false);
    }
  };

  const validateStep1 = (): boolean => {
    if (!rutValidated) {
      setErrors({ rut_empresa: 'Debes validar el RUT primero' });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_local || formData.nombre_local.length < 2) {
      newErrors.nombre_local = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.telefono_local || formData.telefono_local.length !== 9) {
      newErrors.telefono_local = 'Telefono invalido (9 digitos)';
    }
    if (!formData.correo_local || !formData.correo_local.includes('@')) {
      newErrors.correo_local = 'Correo invalido';
    }
    if (!formData.calle || formData.calle.length < 3) {
      newErrors.calle = 'Ingresa una direccion valida';
    }
    if (!formData.numero || parseInt(formData.numero) <= 0) {
      newErrors.numero = 'Numero invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_gerente || formData.nombre_gerente.length < 2) {
      newErrors.nombre_gerente = 'Nombre muy corto';
    }
    if (!formData.correo_gerente || !formData.correo_gerente.includes('@')) {
      newErrors.correo_gerente = 'Correo invalido';
    }
    if (!formData.telefono_gerente || formData.telefono_gerente.length !== 9) {
      newErrors.telefono_gerente = 'Telefono invalido';
    }
    if (!formData.contrasena || formData.contrasena.length < 6) {
      newErrors.contrasena = 'Minimo 6 caracteres';
    }
    if (formData.contrasena !== formData.confirmar_contrasena) {
      newErrors.confirmar_contrasena = 'Las contrasenas no coinciden';
    }
    if (!formData.acepta_terminos) {
      newErrors.acepta_terminos = 'Debes aceptar los terminos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        if (isValid) {
          handleSubmit();
          return;
        }
        break;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push('/register');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await api.registerEmpresa({
        rut_empresa: formData.rut_empresa.replace(/\./g, ''),
        razon_social: formData.razon_social,
        nombre_local: formData.nombre_local,
        telefono_local: formData.telefono_local,
        correo_local: formData.correo_local,
        descripcion: formData.descripcion || undefined,
        id_tipo_local: formData.id_tipo_local,
        calle: formData.calle,
        numero: parseInt(formData.numero),
        id_comuna: formData.id_comuna,
        nombre_gerente: formData.nombre_gerente,
        correo_gerente: formData.correo_gerente,
        telefono_gerente: formData.telefono_gerente,
        contrasena: formData.contrasena,
        acepta_terminos: formData.acepta_terminos,
      });

      if (result.success) {
        showToast('success', 'Empresa registrada exitosamente');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar empresa';
      showToast('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'RUT Empresa', icon: Building2 },
    { number: 2, title: 'Datos Local', icon: Store },
    { number: 3, title: 'Gerente', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
          >
            <ArrowLeft size={24} className="text-[#64748B]" />
          </button>
          <h1 className="text-xl font-semibold text-[#334155]">
            Registro de Empresa
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white'
                          : 'bg-[#E2E8F0] text-[#64748B]'
                      }
                    `}
                  >
                    {currentStep > step.number ? (
                      <Check size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs ${
                      currentStep >= step.number
                        ? 'text-[#F97316]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      currentStep > step.number
                        ? 'bg-[#F97316]'
                        : 'bg-[#E2E8F0]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6">
          {/* Step 1: RUT */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-[#334155]">
                  Validacion de RUT
                </h2>
                <p className="text-sm text-[#64748B] mt-1">
                  Ingresa el RUT de tu empresa para validarlo con el SII
                </p>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                  RUT Empresa
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Building2
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type="text"
                      value={formData.rut_empresa}
                      onChange={(e) => handleRutChange(e.target.value)}
                      placeholder="76.XXX.XXX-X"
                      maxLength={12}
                      className={`
                        w-full pl-10 pr-4 py-2.5 border rounded-xl
                        ${
                          errors.rut_empresa
                            ? 'border-[#EF4444]'
                            : 'border-[#E2E8F0]'
                        }
                        focus:outline-none focus:ring-2 focus:ring-[#F97316]/20
                      `}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={validateRut}
                    disabled={isValidatingRut || !formData.rut_empresa}
                    className="px-6 py-2.5 bg-[#334155] text-white rounded-xl hover:bg-[#1E293B] disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isValidatingRut ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <FileCheck size={18} />
                    )}
                    Validar
                  </button>
                </div>
                {errors.rut_empresa && (
                  <p className="mt-1.5 text-sm text-[#EF4444]">
                    {errors.rut_empresa}
                  </p>
                )}
              </div>

              {rutValidated && (
                <div className="p-4 bg-[#F0FDF4] border border-[#22C55E]/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="text-[#22C55E]" size={20} />
                    <span className="font-medium text-[#166534]">
                      RUT Validado
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-[#334155]">
                      <strong>Razon Social:</strong> {formData.razon_social}
                    </p>
                    {formData.glosa_giro && (
                      <p className="text-[#64748B]">
                        <strong>Giro:</strong> {formData.glosa_giro}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Local Info */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-[#334155]">
                  Datos del Local
                </h2>
                <p className="text-sm text-[#64748B] mt-1">
                  Informacion de tu establecimiento
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Nombre del Local
                  </label>
                  <div className="relative">
                    <Store
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type="text"
                      value={formData.nombre_local}
                      onChange={(e) =>
                        handleChange('nombre_local', e.target.value)
                      }
                      placeholder="Ej: Restaurante El Gran Sabor"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                        errors.nombre_local
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.nombre_local && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.nombre_local}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Tipo de Local
                  </label>
                  <select
                    value={formData.id_tipo_local}
                    onChange={(e) =>
                      handleChange('id_tipo_local', parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl"
                  >
                    {TIPOS_LOCAL.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Telefono Local
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type="tel"
                      value={formData.telefono_local}
                      onChange={(e) =>
                        handleChange(
                          'telefono_local',
                          e.target.value.replace(/\D/g, '')
                        )
                      }
                      placeholder="912345678"
                      maxLength={9}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                        errors.telefono_local
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.telefono_local && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.telefono_local}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Correo del Local
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type="email"
                      value={formData.correo_local}
                      onChange={(e) =>
                        handleChange('correo_local', e.target.value)
                      }
                      placeholder="contacto@tulocal.cl"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                        errors.correo_local
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.correo_local && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.correo_local}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Direccion
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <MapPin
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                        size={20}
                      />
                      <input
                        type="text"
                        value={formData.calle}
                        onChange={(e) => handleChange('calle', e.target.value)}
                        placeholder="Av. Principal"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                          errors.calle ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                        }`}
                      />
                    </div>
                    <input
                      type="number"
                      value={formData.numero}
                      onChange={(e) => handleChange('numero', e.target.value)}
                      placeholder="N°"
                      className={`w-24 px-4 py-2.5 border rounded-xl ${
                        errors.numero ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {(errors.calle || errors.numero) && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.calle || errors.numero}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Descripcion (opcional)
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      handleChange('descripcion', e.target.value)
                    }
                    placeholder="Describe tu local..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Manager Info */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-[#334155]">
                  Datos del Gerente
                </h2>
                <p className="text-sm text-[#64748B] mt-1">
                  Cuenta del administrador principal
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type="text"
                      value={formData.nombre_gerente}
                      onChange={(e) =>
                        handleChange('nombre_gerente', e.target.value)
                      }
                      placeholder="Juan Perez"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                        errors.nombre_gerente
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.nombre_gerente && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.nombre_gerente}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Correo
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type="email"
                      value={formData.correo_gerente}
                      onChange={(e) =>
                        handleChange('correo_gerente', e.target.value)
                      }
                      placeholder="gerente@empresa.cl"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                        errors.correo_gerente
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.correo_gerente && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.correo_gerente}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Telefono
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type="tel"
                      value={formData.telefono_gerente}
                      onChange={(e) =>
                        handleChange(
                          'telefono_gerente',
                          e.target.value.replace(/\D/g, '')
                        )
                      }
                      placeholder="987654321"
                      maxLength={9}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                        errors.telefono_gerente
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.telefono_gerente && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.telefono_gerente}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Contrasena
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.contrasena}
                      onChange={(e) =>
                        handleChange('contrasena', e.target.value)
                      }
                      placeholder="••••••"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-xl ${
                        errors.contrasena
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.contrasena && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.contrasena}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#334155]">
                    Confirmar
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      size={20}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmar_contrasena}
                      onChange={(e) =>
                        handleChange('confirmar_contrasena', e.target.value)
                      }
                      placeholder="••••••"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-xl ${
                        errors.confirmar_contrasena
                          ? 'border-[#EF4444]'
                          : 'border-[#E2E8F0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.confirmar_contrasena && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.confirmar_contrasena}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acepta_terminos}
                      onChange={(e) =>
                        handleChange('acepta_terminos', e.target.checked)
                      }
                      className="mt-1 w-4 h-4 text-[#F97316] border-[#E2E8F0] rounded"
                    />
                    <span className="text-sm text-[#64748B]">
                      Acepto los{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-[#F97316] hover:underline"
                      >
                        Terminos y Condiciones para Empresas
                      </button>
                    </span>
                  </label>
                  {errors.acepta_terminos && (
                    <p className="mt-1 text-xs text-[#EF4444]">
                      {errors.acepta_terminos}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            >
              {currentStep === 1 ? 'Cancelar' : 'Atras'}
            </button>
            <PrimaryButton
              onClick={handleNext}
              className="flex-1 h-12"
              isLoading={isSubmitting}
              disabled={isSubmitting || (currentStep === 1 && !rutValidated)}
            >
              <span className="flex items-center gap-2 justify-center">
                {currentStep === 3 ? (
                  isSubmitting ? (
                    'Registrando...'
                  ) : (
                    'Registrar Empresa'
                  )
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={18} />
                  </>
                )}
              </span>
            </PrimaryButton>
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

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="empresa"
      />
    </div>
  );
}
