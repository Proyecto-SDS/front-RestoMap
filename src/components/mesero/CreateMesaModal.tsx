import { X } from 'lucide-react';
import React, { useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface CreateMesaModalProps {
  onClose: () => void;
  onMesaCreate: (mesa: Mesa) => void;
}

export function CreateMesaModal({
  onClose,
  onMesaCreate,
}: CreateMesaModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: 4,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
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
      // Mock API call - POST /api/empresa/mesas
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newMesa: Mesa = {
        id: `M-${Date.now()}`,
        id_empresa: '1',
        nombre: formData.nombre,
        capacidad: formData.capacidad,
        estado: 'DISPONIBLE',
        pedidos_count: 0,
      };

      onMesaCreate(newMesa);
      onClose();
    } catch (error) {
      console.error('Error creating mesa:', error);
      setErrors({ submit: 'Error al crear la mesa. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl text-[#334155]">Nueva Mesa</h2>
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
              placeholder="Ej: Mesa 1, Mesa VIP, Terraza A"
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
            {errors.nombre && (
              <p className="mt-1.5 text-xs text-[#EF4444]">{errors.nombre}</p>
            )}
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
            <p className="mt-1.5 text-xs text-[#64748B]">
              Entre 1 y 20 personas
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
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
              {isLoading ? 'Creando...' : 'Crear Mesa'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
