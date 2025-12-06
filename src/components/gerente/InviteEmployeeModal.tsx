import { Mail, X } from 'lucide-react';
import React, { useState } from 'react';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface InviteEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteEmployeeModal({
  onClose,
  onSuccess,
}: InviteEmployeeModalProps) {
  const [formData, setFormData] = useState({
    correo: '',
    rol: 'mesero',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const roles = [
    { value: 'mesero', label: 'Mesero' },
    { value: 'cocinero', label: 'Cocinero' },
    { value: 'bartender', label: 'Bartender' },
    { value: 'gerente', label: 'Gerente' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.empresa.createInvitation(
        formData.correo,
        formData.rol
      );

      setSuccessMessage(`Invitación enviada exitosamente a ${formData.correo}`);

      // Esperar un poco para mostrar el mensaje de éxito
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al enviar invitación';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl text-[#334155]">Invitar Nuevo Empleado</h2>
            <p className="text-sm text-[#94A3B8] mt-1">
              Se enviará una invitación por correo electrónico
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
              placeholder="empleado@ejemplo.com"
              className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.correo
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
              }`}
            />
            {errors.correo && (
              <p className="mt-1.5 text-xs text-[#EF4444]">{errors.correo}</p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">
              Rol <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:border-[#F97316] focus:ring-[#F97316]/20 transition-all"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <Mail size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-[#64748B]">
              Se enviará un correo a{' '}
              <strong>{formData.correo || 'este correo'}</strong> con un enlace
              para aceptar la invitación. Si no tiene cuenta, deberá registrarse
              primero.
            </p>
          </div>

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-[#EF4444]">{errors.general}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
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
