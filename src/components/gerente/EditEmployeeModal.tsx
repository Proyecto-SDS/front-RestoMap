import { Mail, X } from 'lucide-react';
import React, { useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface Empleado {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: 'activo' | 'inactivo';
}

interface EditEmployeeModalProps {
  empleado: Empleado;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmployeeModal({ empleado, onClose, onSuccess }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    nombre: empleado.nombre,
    telefono: empleado.telefono || '',
    rol: empleado.rol,
    estado: empleado.estado,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'mesero', label: 'Mesero' },
    { value: 'cocinero', label: 'Cocinero' },
    { value: 'bartender', label: 'Bartender' },
    { value: 'reservas', label: 'Reservas' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
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
      // PATCH /api/empresa/empleados/${empleado.id}
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess();
      onClose();
    } catch {
      setErrors({ general: 'Error al actualizar empleado' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with real API
      // POST /api/empresa/empleados/${empleado.id}/reset-password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowResetConfirm(false);
      // Show success toast
      alert('Correo de restablecimiento enviado');
    } catch {
      alert('Error al eliminar empleado');
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
            <h2 className="text-xl text-[#334155]">Editar Empleado</h2>
            <p className="text-sm text-[#94A3B8] mt-1">{empleado.nombre}</p>
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
              className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.nombre
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
              }`}
            />
            {errors.nombre && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.nombre}</p>}
          </div>

          {/* Correo (read-only) */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">Correo electrónico</label>
            <input
              type="email"
              value={empleado.correo}
              readOnly
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-[#94A3B8]">El correo no se puede modificar</p>
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
            <label className="block text-sm text-[#334155] mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+56 9 1234 5678"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:border-[#F97316] focus:ring-[#F97316]/20 transition-all"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm text-[#334155] mb-2">Estado</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value="activo"
                  checked={formData.estado === 'activo'}
                  onChange={() => setFormData({ ...formData, estado: 'activo' })}
                  className="w-4 h-4 text-[#F97316] focus:ring-[#F97316]"
                />
                <span className="text-sm text-[#334155]">Activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value="inactivo"
                  checked={formData.estado === 'inactivo'}
                  onChange={() => setFormData({ ...formData, estado: 'inactivo' })}
                  className="w-4 h-4 text-[#F97316] focus:ring-[#F97316]"
                />
                <span className="text-sm text-[#334155]">Inactivo</span>
              </label>
            </div>
          </div>

          {/* Reset password */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Mail size={16} />
              Enviar correo de restablecimiento de contraseña
            </button>
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
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </PrimaryButton>
          </div>
        </form>
      </div>

      {/* Reset password confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg text-[#334155] mb-2">¿Resetear contraseña?</h3>
            <p className="text-sm text-[#64748B] mb-6">
              Se enviará un correo a <strong>{empleado.correo}</strong> con instrucciones para
              restablecer su contraseña.
            </p>
            <div className="flex gap-3">
              <SecondaryButton
                onClick={() => setShowResetConfirm(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                onClick={handleResetPassword}
                className="flex-1"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Sí, enviar
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
