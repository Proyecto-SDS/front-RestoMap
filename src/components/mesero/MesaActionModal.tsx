
import { CheckCircle, Edit, Eye, Receipt, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { QRGenerateModal } from './QRGenerateModal';

interface MesaActionModalProps {
  mesa: Mesa;
  onClose: () => void;
  onMesaUpdate: (mesa: Mesa) => void;
  onMesaDelete: (mesaId: string) => void;
}

export function MesaActionModal({ mesa, onClose, onMesaUpdate, onMesaDelete }: MesaActionModalProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSentarCliente = () => {
    setShowQRModal(true);
  };

  const handleLimpiarMesa = async () => {
    // Update mesa status to DISPONIBLE
    const updatedMesa = { ...mesa, estado: 'DISPONIBLE' as const, pedidos_count: 0 };
    onMesaUpdate(updatedMesa);
    onClose();
  };

  const handleDeleteMesa = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    // Mock API call - DELETE /api/empresa/mesas/{id}
    await new Promise(resolve => setTimeout(resolve, 500));
    onMesaDelete(mesa.id);
    onClose();
  };

  const canSentarCliente = mesa.estado === 'DISPONIBLE';
  const canLimpiarMesa = mesa.estado === 'PAGADO';
  const hasPedidos = (mesa.pedidos_count || 0) > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl text-[#334155]">{mesa.nombre}</h2>
              <p className="text-sm text-[#94A3B8]">
                Capacidad: {mesa.capacidad} personas
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Actions */}
          <div className="p-6 space-y-3">
            {/* Sentar Cliente */}
            {canSentarCliente && (
              <button
                onClick={handleSentarCliente}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-[#F97316] bg-[#FFF7ED] text-[#F97316] rounded-xl hover:bg-[#F97316] hover:text-white transition-all"
              >
                <UserPlus size={20} />
                <div className="text-left flex-1">
                  <p className="text-sm">Sentar Cliente</p>
                  <p className="text-xs opacity-80">Generar código QR para la mesa</p>
                </div>
              </button>
            )}

            {/* Ver Pedidos */}
            {hasPedidos && (
              <button
                onClick={() => alert('Ver pedidos de esta mesa - Próximamente')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-[#E2E8F0] bg-white text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-all"
              >
                <Eye size={20} />
                <div className="text-left flex-1">
                  <p className="text-sm">Ver Pedidos</p>
                  <p className="text-xs text-[#64748B]">{mesa.pedidos_count} pedidos activos</p>
                </div>
              </button>
            )}

            {/* Generar Boleta */}
            {hasPedidos && (
              <button
                onClick={() => alert('Generar boleta - Ir a pestaña Boleta')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-[#E2E8F0] bg-white text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-all"
              >
                <Receipt size={20} />
                <div className="text-left flex-1">
                  <p className="text-sm">Generar Boleta</p>
                  <p className="text-xs text-[#64748B]">Crear boleta de pago</p>
                </div>
              </button>
            )}

            {/* Limpiar Mesa */}
            {canLimpiarMesa && (
              <button
                onClick={handleLimpiarMesa}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-[#22C55E] bg-green-50 text-[#22C55E] rounded-xl hover:bg-[#22C55E] hover:text-white transition-all"
              >
                <CheckCircle size={20} />
                <div className="text-left flex-1">
                  <p className="text-sm">Limpiar Mesa</p>
                  <p className="text-xs opacity-80">Marcar como disponible</p>
                </div>
              </button>
            )}

            {/* Editar Mesa */}
            <button
              onClick={() => alert('Editar mesa - Próximamente')}
              className="w-full flex items-center gap-3 px-4 py-3 border border-[#E2E8F0] bg-white text-[#334155] rounded-xl hover:bg-[#F8FAFC] transition-all"
            >
              <Edit size={20} />
              <div className="text-left flex-1">
                <p className="text-sm">Editar Mesa</p>
                <p className="text-xs text-[#64748B]">Modificar nombre o capacidad</p>
              </div>
            </button>

            {/* Eliminar Mesa */}
            <button
              onClick={handleDeleteMesa}
              className={`
                w-full flex items-center gap-3 px-4 py-3 border rounded-xl transition-all
                ${showConfirmDelete
                  ? 'border-[#EF4444] bg-red-50 text-[#EF4444]'
                  : 'border-[#E2E8F0] bg-white text-[#EF4444] hover:bg-red-50'
                }
              `}
            >
              <Trash2 size={20} />
              <div className="text-left flex-1">
                <p className="text-sm">
                  {showConfirmDelete ? '¿Confirmar eliminación?' : 'Eliminar Mesa'}
                </p>
                <p className="text-xs opacity-80">
                  {showConfirmDelete ? 'Click nuevamente para confirmar' : 'Acción permanente'}
                </p>
              </div>
            </button>
          </div>

          {/* Close Button */}
          <div className="p-6 pt-0">
            <SecondaryButton onClick={onClose} className="w-full">
              Cerrar
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* QR Generate Modal */}
      {showQRModal && (
        <QRGenerateModal
          mesa={mesa}
          onClose={() => {
            setShowQRModal(false);
            // Update mesa status to OCUPADA after generating QR
            onMesaUpdate({ ...mesa, estado: 'OCUPADA' });
          }}
        />
      )}
    </>
  );
}
