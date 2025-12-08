import { CheckCircle, DollarSign, X } from 'lucide-react';
import { useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface ConfirmarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (metodo: string) => void;
  monto: number;
  isLoading?: boolean;
}

const metodosPago: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  debito: 'Débito',
  credito: 'Crédito',
  app_de_pago: 'App de Pago',
  otro: 'Otro',
};

export function ConfirmarPagoModal({
  isOpen,
  onClose,
  onConfirm,
  monto,
  isLoading = false,
}: ConfirmarPagoModalProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('efectivo');

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-[#22C55E]" />
            </div>
            <h2 className="text-xl font-semibold text-[#334155]">
              Confirmar Pago
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#94A3B8] hover:text-[#64748B] transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-[#64748B]">
            Por favor, revisa los detalles del pago antes de confirmar:
          </p>

          {/* Detalles del Pago */}
          <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-4">
            {/* Monto */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-sm font-medium text-[#64748B]">
                Monto Total:
              </span>
              <span className="text-2xl font-bold text-[#22C55E]">
                {formatCurrency(monto)}
              </span>
            </div>

            {/* Método de Pago - Selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#64748B]">
                <DollarSign size={18} />
                Método de Pago:
              </label>
              <select
                value={metodoSeleccionado}
                onChange={(e) => setMetodoSeleccionado(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {Object.entries(metodosPago).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Al confirmar, el pedido se marcará como
              completado y la mesa quedará disponible.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-[#E2E8F0]">
          <SecondaryButton
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            onClick={() => onConfirm(metodoSeleccionado)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Procesando...' : 'Confirmar Pago'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
