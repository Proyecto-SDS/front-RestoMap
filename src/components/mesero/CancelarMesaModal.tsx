import { AlertTriangle, X } from 'lucide-react';
import { DangerButton } from '../buttons/DangerButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface CancelarMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mesaNombre: string;
  hasPedido: boolean;
}

export function CancelarMesaModal({
  isOpen,
  onClose,
  onConfirm,
  mesaNombre,
  hasPedido,
}: CancelarMesaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} className="text-[#EF4444]" />
            </div>
            <h2 className="text-xl text-[#334155]">Cancelar Mesa</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-[#64748B]">
            ¿Estás seguro de que deseas cancelar la{' '}
            <span className="text-[#334155]">{mesaNombre}</span>?
          </p>

          {hasPedido && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> Esta mesa tiene un pedido activo.
                Al cancelar la mesa, también se cancelará el pedido asociado.
              </p>
            </div>
          )}

          <p className="text-sm text-[#94A3B8]">
            Esta acción liberará la mesa y la pondrá en estado disponible.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-[#E2E8F0]">
          <SecondaryButton onClick={onClose} className="flex-1">
            Cancelar
          </SecondaryButton>
          <DangerButton onClick={onConfirm} className="flex-1">
            Sí, Cancelar Mesa
          </DangerButton>
        </div>
      </div>
    </div>
  );
}
