'use client';

import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface EditMesaModalProps {
  mesa: Mesa;
  onClose: () => void;
  onMesaUpdate: (mesa: Mesa) => void;
  onMesaDelete: (mesaId: string) => void;
}

export function EditMesaModal({
  mesa,
  onClose,
  onMesaUpdate,
  onMesaDelete,
}: EditMesaModalProps) {
  const [formData, setFormData] = useState({
    nombre: mesa.nombre,
    capacidad: mesa.capacidad,
    descripcion: mesa.descripcion || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 30) {
      newErrors.nombre = 'El nombre no puede exceder 30 caracteres';
    }

    if (formData.capacidad < 1 || formData.capacidad > 20) {
      newErrors.capacidad = 'La capacidad debe estar entre 1 y 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await api.empresa.updateMesa(Number(mesa.id), {
        nombre: formData.nombre,
        capacidad: formData.capacidad,
        descripcion: formData.descripcion,
      });

      const updatedMesa: Mesa = {
        ...mesa,
        nombre: response.mesa.nombre,
        capacidad: response.mesa.capacidad,
        descripcion: response.mesa.descripcion || '',
      };

      onMesaUpdate(updatedMesa);
    } catch (error) {
      console.error('Error actualizando mesa:', error);
      setErrors({ submit: 'Error al actualizar la mesa. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await api.empresa.deleteMesa(Number(mesa.id));
      onMesaDelete(mesa.id);
    } catch (error: unknown) {
      console.error('Error eliminando mesa:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al eliminar la mesa. Verifica que no tenga pedidos activos.';
      setErrors({ submit: errorMessage });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl text-[#334155]">Editar Mesa</h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block mb-1.5 text-[#334155]">
              Nombre de la Mesa
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Mesa 1, Mesa VIP"
              maxLength={30}
              className={`
                w-full px-3 py-2.5 border rounded-xl
                transition-all duration-200
                focus:outline-none focus:ring-2
                ${
                  errors.nombre
                    ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                    : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                }
              `}
            />
            <div className="flex justify-between mt-1.5">
              {errors.nombre ? (
                <p className="text-xs text-[#EF4444]">{errors.nombre}</p>
              ) : (
                <span></span>
              )}
              <p className="text-xs text-[#94A3B8]">
                {formData.nombre.length}/30
              </p>
            </div>
          </div>

          {/* Capacidad */}
          <div>
            <label htmlFor="capacidad" className="block mb-1.5 text-[#334155]">
              Capacidad (personas)
            </label>
            <input
              type="number"
              id="capacidad"
              min="1"
              max="20"
              value={formData.capacidad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacidad: parseInt(e.target.value) || 1,
                })
              }
              className={`
                w-full px-3 py-2.5 border rounded-xl
                transition-all duration-200
                focus:outline-none focus:ring-2
                ${
                  errors.capacidad
                    ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                    : 'border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20'
                }
              `}
            />
            {errors.capacidad && (
              <p className="mt-1.5 text-xs text-[#EF4444]">
                {errors.capacidad}
              </p>
            )}
          </div>

          {/* Descripcion */}
          <div>
            <label
              htmlFor="descripcion"
              className="block mb-1.5 text-[#334155]"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Ej: Mesa junto a la ventana, zona VIP..."
              rows={3}
              maxLength={100}
              className="
                w-full px-3 py-2.5 border rounded-xl
                transition-all duration-200
                focus:outline-none focus:ring-2
                border-[#E2E8F0] focus:border-[#F97316] focus:ring-[#F97316]/20
                resize-none
              "
            />
            <p className="mt-1 text-xs text-[#94A3B8]">
              {formData.descripcion.length}/100 caracteres
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading || isDeleting}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              className="flex-1"
              isLoading={isLoading}
              disabled={isLoading || isDeleting}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </PrimaryButton>
          </div>

          {/* Separador */}
          <div className="border-t border-[#E2E8F0] pt-4 mt-4">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-2.5 rounded-xl
                  text-[#EF4444] bg-red-50 hover:bg-red-100
                  transition-colors
                "
              >
                <Trash2 size={16} />
                Eliminar Mesa
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-center text-[#64748B]">
                  ¿Estás seguro de eliminar esta mesa?
                </p>
                <div className="flex gap-3">
                  <SecondaryButton
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    No, cancelar
                  </SecondaryButton>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="
                      flex-1 flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-xl
                      text-white bg-[#EF4444] hover:bg-[#DC2626]
                      transition-colors disabled:opacity-50
                    "
                  >
                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
