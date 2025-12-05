import { X } from 'lucide-react';
import { useState } from 'react';
import { Producto } from '../../screens/cocinero/DashboardCocineroScreen';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { ModalPortal } from '../modals/ModalPortal';

interface EditProductModalProps {
  producto: Producto;
  onClose: () => void;
  onUpdate: (producto: Producto) => void;
}

export function EditProductModal({
  producto,
  onClose,
  onUpdate,
}: EditProductModalProps) {
  const [estado, setEstado] = useState<'disponible' | 'agotado' | 'inactivo'>(
    producto.estado
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Llamar al API real
      await api.empresa.updateProductoEstado(parseInt(producto.id), estado);

      const updatedProducto = {
        ...producto,
        estado,
      };

      onUpdate(updatedProducto);
      onClose();
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalPortal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full pointer-events-auto">
          {/* Header */}
          <div className="border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl text-[#334155]">Editar Producto</h2>
              <p className="text-sm text-[#64748B]">{producto.nombre}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Read-only fields */}
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={producto.nombre}
                disabled
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={producto.categoria_nombre}
                disabled
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] mb-1">
                Precio
              </label>
              <input
                type="text"
                value={`$${producto.precio.toLocaleString('es-CL')}`}
                disabled
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            {/* Editable field */}
            <div>
              <label className="block text-sm text-[#334155] mb-2">
                Disponibilidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setEstado(
                      estado === 'disponible' ? 'agotado' : 'disponible'
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    estado === 'disponible' ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      estado === 'disponible'
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
                <span
                  className={`text-sm ${
                    estado === 'disponible'
                      ? 'text-[#22C55E]'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {estado === 'disponible' ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                Los productos marcados como &quot;No disponible&quot; no
                aparecerán en el menú del cliente
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#E2E8F0] px-6 py-4 flex gap-3">
            <SecondaryButton onClick={onClose} className="flex-1">
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={handleSave}
              isLoading={isLoading}
              disabled={isLoading || estado === producto.estado}
              className="flex-1"
            >
              Guardar
            </PrimaryButton>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
