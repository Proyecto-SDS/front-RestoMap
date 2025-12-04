import { X } from 'lucide-react';
import { useState } from 'react';
import { Producto } from '../../screens/cocinero/DashboardCocineroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { Toast, useToast } from '../notifications/Toast';

interface EditProductModalProps {
  producto: Producto;
  onClose: () => void;
  onUpdate: (producto: Producto) => void;
}

export function EditProductModal({ producto, onClose, onUpdate }: EditProductModalProps) {
  const [disponible, setDisponible] = useState(producto.disponible);
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Mock API call - PATCH /api/empresa/productos/{id}
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedProducto = {
        ...producto,
        disponible,
      };

      onUpdate(updatedProducto);
      showToast('success', 'Producto actualizado correctamente');

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      alert('Error al actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
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
              <label className="block text-sm text-[#94A3B8] mb-1">Nombre</label>
              <input
                type="text"
                value={producto.nombre}
                disabled
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] mb-1">Categoría</label>
              <input
                type="text"
                value={producto.categoria_nombre}
                disabled
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] mb-1">Precio</label>
              <input
                type="text"
                value={`$${producto.precio.toLocaleString('es-CL')}`}
                disabled
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
              />
            </div>

            {/* Editable field */}
            <div>
              <label className="block text-sm text-[#334155] mb-2">Disponibilidad</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDisponible(!disponible)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    disponible ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      disponible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${disponible ? 'text-[#22C55E]' : 'text-[#94A3B8]'}`}>
                  {disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                Los productos marcados como "No disponible" no aparecerán en el menú del cliente
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
              disabled={isLoading || disponible === producto.disponible}
              className="flex-1"
            >
              Guardar
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
    </>
  );
}
