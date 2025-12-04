import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Pedido, PedidoEstado } from '../../screens/mesero/DashboardMeseroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { Toast, useToast } from '../notifications/Toast';

interface PedidoDetailModalProps {
  pedido: Pedido;
  onClose: () => void;
  onUpdate: (pedido: Pedido) => void;
}

export function PedidoDetailModal({ pedido, onClose, onUpdate }: PedidoDetailModalProps) {
  const [estado, setEstado] = useState<PedidoEstado>(pedido.estado);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle save changes
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - PATCH /api/empresa/pedidos/{id}
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedPedido = {
        ...pedido,
        estado,
      };
      
      onUpdate(updatedPedido);
      showToast('success', 'Pedido actualizado correctamente');
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      alert('Error al actualizar el estado del pedido');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - DELETE /api/empresa/pedidos/{id}
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const cancelledPedido = {
        ...pedido,
        estado: 'CANCELADO' as PedidoEstado,
      };
      
      onUpdate(cancelledPedido);
      showToast('success', 'Pedido cancelado correctamente');
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      alert('Error al eliminar el pedido');
    } finally {
      setIsLoading(false);
      setShowCancelConfirm(false);
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
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl text-[#334155]">Orden #{pedido.id}</h2>
              <p className="text-sm text-[#64748B]">Gestiona los detalles del pedido</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Mesa</p>
                <p className="text-[#334155]">{pedido.mesa_nombre}</p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Hora</p>
                <p className="text-[#334155]">{formatDate(pedido.creado_el)}</p>
              </div>
              {pedido.usuario_nombre && (
                <div className="col-span-2">
                  <p className="text-xs text-[#94A3B8] mb-1">Cliente</p>
                  <p className="text-[#334155]">{pedido.usuario_nombre}</p>
                </div>
              )}
            </div>

            {/* Items list */}
            <div>
              <h3 className="text-[#334155] mb-3">Productos</h3>
              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-[#64748B]">Producto</th>
                      <th className="text-center px-4 py-2 text-xs text-[#64748B]">Cant.</th>
                      <th className="text-right px-4 py-2 text-xs text-[#64748B]">Precio Unit.</th>
                      <th className="text-right px-4 py-2 text-xs text-[#64748B]">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.lineas?.map((linea) => (
                      <tr key={linea.id} className="border-t border-[#E2E8F0]">
                        <td className="px-4 py-3 text-sm text-[#334155]">
                          {linea.producto_nombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B] text-center">
                          {linea.cantidad}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B] text-right">
                          {formatCurrency(linea.precio_unitario)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#334155] text-right">
                          {formatCurrency(linea.cantidad * linea.precio_unitario)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0]">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-[#334155]">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-[#F97316]">
                        {formatCurrency(pedido.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {pedido.notas && (
              <div>
                <p className="text-xs text-[#94A3B8] mb-2">Notas del cliente</p>
                <p className="text-sm text-[#64748B] italic bg-[#F8FAFC] p-3 rounded-lg">
                  {pedido.notas}
                </p>
              </div>
            )}

            {/* Status selector */}
            <div>
              <label className="block text-sm text-[#334155] mb-2">
                Estado del pedido
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as PedidoEstado)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                disabled={pedido.estado === 'CANCELADO' || pedido.estado === 'PAGADO'}
              >
                <option value="TOMADO">Tomado</option>
                <option value="EN_COCINA">En Cocina</option>
                <option value="LISTO">Listo</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="PAGADO">Pagado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Cancel confirmation */}
            {showCancelConfirm && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-3">
                  ¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelOrder}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Sí, cancelar pedido
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 bg-white text-[#64748B] text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    No, mantener
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-[#E2E8F0] px-6 py-4 flex flex-col sm:flex-row gap-3">
            <SecondaryButton
              onClick={onClose}
              className="flex-1 sm:flex-initial"
            >
              Cerrar
            </SecondaryButton>
            
            {pedido.estado !== 'CANCELADO' && pedido.estado !== 'PAGADO' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                Cancelar orden
              </button>
            )}
            
            <PrimaryButton
              onClick={handleSave}
              isLoading={isLoading}
              disabled={isLoading || estado === pedido.estado}
              className="flex-1 sm:flex-initial"
            >
              Guardar cambios
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
