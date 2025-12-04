import { Check, Copy, Mail, X } from 'lucide-react';
import React, { useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface InviteEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteEmployeeModal({ onClose, onSuccess }: InviteEmployeeModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: 'mesero',
    telefono: '',
    contrasena: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'mesero', label: 'Mesero' },
    { value: 'cocinero', label: 'Cocinero' },
    { value: 'bartender', label: 'Bartender' },
    { value: 'reservas', label: 'Reservas' },
  ];

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, contrasena: password });
  };

  const copyPassword = async () => {
    if (formData.contrasena) {
      await navigator.clipboard.writeText(formData.contrasena);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'Genera una contraseña temporal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Mock API call - replace with real API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success
      onSuccess();
      onClose();
    } catch {
      alert('Error al enviar la invitación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl text-[#334155]">Invitar Nuevo Empleado</h2>
            <p className="text-sm text-[#94A3B8] mt-1">
              Se enviará un correo con las credenciales
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#94A3B8]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">
              Nombre completo <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                setErrors({ ...errors, nombre: '' });
              }}
              placeholder="Juan Pérez"
              className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.nombre
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
              }`}
            />
            {errors.nombre && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.nombre}</p>}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">
              Correo electrónico <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => {
                setFormData({ ...formData, correo: e.target.value });
                setErrors({ ...errors, correo: '' });
              }}
              placeholder="juan@ejemplo.com"
              className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.correo
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
              }`}
            />
            {errors.correo && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.correo}</p>}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">
              Rol <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:border-[#F97316] focus:ring-[#F97316]/20 transition-all"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">Teléfono (opcional)</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+56 9 1234 5678"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:border-[#F97316] focus:ring-[#F97316]/20 transition-all"
            />
          </div>

          {/* Contraseña temporal */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">
              Contraseña temporal <span className="text-[#EF4444]">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.contrasena}
                onChange={(e) => {
                  setFormData({ ...formData, contrasena: e.target.value });
                  setErrors({ ...errors, contrasena: '' });
                }}
                placeholder="Haz clic en generar"
                className={`flex-1 px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.contrasena
                    ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                    : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                }`}
                readOnly
              />
              <SecondaryButton type="button" onClick={generatePassword} size="sm">
                Generar
              </SecondaryButton>
              {formData.contrasena && (
                <button
                  type="button"
                  onClick={copyPassword}
                  className="px-3 py-2 border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-colors"
                  title="Copiar"
                >
                  {copied ? <Check size={16} className="text-[#22C55E]" /> : <Copy size={16} />}
                </button>
              )}
            </div>
            {errors.contrasena && (
              <p className="mt-1.5 text-xs text-[#EF4444]">{errors.contrasena}</p>
            )}
            <p className="mt-1.5 text-xs text-[#94A3B8]">
              Esta contraseña será enviada por correo al empleado
            </p>
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <Mail size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-[#64748B]">
              Se enviará un correo a <strong>{formData.correo || 'este correo'}</strong> con las
              credenciales y un enlace de activación.
            </p>
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-[#EF4444]">{errors.general}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <SecondaryButton type="button" onClick={onClose} className="flex-1">
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              className="flex-1"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Invitación'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
