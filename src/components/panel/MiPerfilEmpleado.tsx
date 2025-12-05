'use client';

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Save,
  Store,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface MiPerfilEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export function MiPerfilEmpleado({
  isOpen,
  onClose,
  user: userProp,
}: MiPerfilEmpleadoProps) {
  const { user: userContext, updateProfile } = useAuth();
  const user = userProp || userContext;

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: user?.name || '',
    telefono: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!isOpen) return null;

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
    if (!isEditing) {
      setFormData({
        nombre: user?.name || '',
        telefono: user?.phone || '',
      });
    }
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    setError(null);
    setSuccess(null);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile(formData.nombre, formData.telefono);
      if (result.success) {
        setSuccess('Perfil actualizado correctamente');
        setIsEditing(false);
      } else {
        setError(result.error || 'Error al actualizar el perfil');
      }
    } catch {
      setError('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Implementar API para cambio de contraseña
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess('Contraseña actualizada correctamente');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch {
      setError('Error al cambiar la contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  const capitalizeRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-semibold text-[#334155]">Mi Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mensajes de error/éxito */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Info del Local */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EF4444] rounded-xl flex items-center justify-center">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-[#9A3412]">Trabajas en</p>
              <p className="text-lg font-semibold text-[#C2410C]">
                {user?.nombre_local || 'Sin establecimiento'}
              </p>
            </div>
          </div>

          {/* Datos del Empleado */}
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="text-sm text-[#64748B] mb-1 block">
                Nombre
              </label>
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <UserIcon size={18} className="text-[#94A3B8]" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="flex-1 bg-transparent outline-none text-[#334155]"
                  />
                ) : (
                  <span className="text-[#334155]">{user?.name}</span>
                )}
              </div>
            </div>

            {/* Correo (no editable) */}
            <div>
              <label className="text-sm text-[#64748B] mb-1 block">
                Correo electrónico
              </label>
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <Mail size={18} className="text-[#94A3B8]" />
                <span className="text-[#334155]">{user?.email}</span>
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-sm text-[#64748B] mb-1 block">
                Teléfono
              </label>
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <Phone size={18} className="text-[#94A3B8]" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="flex-1 bg-transparent outline-none text-[#334155]"
                  />
                ) : (
                  <span className="text-[#334155]">
                    {user?.phone || 'No registrado'}
                  </span>
                )}
              </div>
            </div>

            {/* Rol (no editable) */}
            <div>
              <label className="text-sm text-[#64748B] mb-1 block">Rol</label>
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <div className="px-3 py-1 bg-[#F97316] text-white text-sm rounded-full">
                  {capitalizeRole(user?.rol || 'empleado')}
                </div>
              </div>
            </div>
          </div>

          {/* Sección Cambiar Contraseña */}
          {isChangingPassword && (
            <div className="space-y-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <h3 className="font-medium text-[#334155]">Cambiar Contraseña</h3>

              {/* Contraseña actual */}
              <div>
                <label className="text-sm text-[#64748B] mb-1 block">
                  Contraseña actual
                </label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <Lock size={18} className="text-[#94A3B8]" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="flex-1 bg-transparent outline-none text-[#334155]"
                    placeholder="Tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="text-sm text-[#64748B] mb-1 block">
                  Nueva contraseña
                </label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <Lock size={18} className="text-[#94A3B8]" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="flex-1 bg-transparent outline-none text-[#334155]"
                    placeholder="Nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="text-sm text-[#64748B] mb-1 block">
                  Confirmar contraseña
                </label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <Lock size={18} className="text-[#94A3B8]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="flex-1 bg-transparent outline-none text-[#334155]"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Botones de contraseña */}
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordToggle}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePassword}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-[#E2E8F0] space-y-3">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleEditToggle}
                className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save size={16} />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleEditToggle}
                className="w-full px-4 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
              >
                Editar Perfil
              </button>
              {!isChangingPassword && (
                <button
                  onClick={handlePasswordToggle}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  Cambiar Contraseña
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
