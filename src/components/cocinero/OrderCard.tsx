import { AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useState } from 'react';
import { Pedido } from '../../screens/cocinero/DashboardCocineroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { Toast, useToast } from '../notifications/Toast';

interface OrderCardProps {
  pedido: Pedido;
  bgColor: string;
  onUpdate: (pedido: Pedido) => void;
}

export function OrderCard({ pedido, bgColor, onUpdate }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // Calculate time since order
  const getTimeSince = () => {
    const now = new Date();
    const created = new Date(pedido.creado_el);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffMinutes < 1) return 'recién';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `hace ${diffHours}h ${diffMinutes % 60}m`;
  };

  // Get urgency level
  const getUrgency = () => {
    const now = new Date();
    const created = new Date(pedido.creado_el);
    const diffMinutes = (now.getTime() - created.getTime()) / 60000;

    if (diffMinutes > 30) return 'critical';
    if (diffMinutes > 15) return 'urgent';
    return 'normal';
  };

  const urgency = getUrgency();
  const timeSince = getTimeSince();

  // Handle status change
  const handleStatusChange = async (
    newEstado: 'RECEPCION' | 'EN_PROCESO' | 'TERMINADO'
  ) => {
    setIsLoading(true);

    try {
      // Mock API call - PATCH /api/empresa/pedidos/{id}
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedPedido = {
        ...pedido,
        estado: newEstado,
      };

      onUpdate(updatedPedido);

      const messages: Record<string, string> = {
        RECEPCION: 'Pedido recibido',
        EN_PROCESO: 'Pedido en proceso',
        TERMINADO: '¡Pedido listo para servir!',
      };

      showToast('success', messages[newEstado]);
    } catch {
      showToast('error', 'Error al actualizar el pedido');
    } finally {
      setIsLoading(false);
    }
  };

  // Get button config based on status
  const getActionButton = () => {
    if (pedido.estado === 'INICIADO') {
      return (
        <PrimaryButton
          onClick={() => handleStatusChange('RECEPCION')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]"
        >
          Recibir Pedido
        </PrimaryButton>
      );
    } else if (pedido.estado === 'RECEPCION') {
      return (
        <PrimaryButton
          onClick={() => handleStatusChange('EN_PROCESO')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
        >
          Comenzar
        </PrimaryButton>
      );
    } else if (pedido.estado === 'EN_PROCESO') {
      return (
        <PrimaryButton
          onClick={() => handleStatusChange('TERMINADO')}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A]"
        >
          Marcar Listo
        </PrimaryButton>
      );
    } else if (pedido.estado === 'TERMINADO') {
      return (
        <button
          disabled
          className="w-full px-4 py-2 text-sm bg-[#E2E8F0] text-[#94A3B8] rounded-lg cursor-not-allowed"
        >
          Esperando mesero
        </button>
      );
    } else {
      return (
        <button
          disabled
          className="w-full px-4 py-2 text-sm bg-[#F0FDF4] text-[#22C55E] rounded-lg cursor-not-allowed"
        >
          Completado
        </button>
      );
    }
  };

  return (
    <>
      <div
        className="rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow"
        style={{ backgroundColor: bgColor }}
      >
        {/* Card Header */}
        <div className="p-4 space-y-3">
          {/* Mesa and urgency */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-[#334155] mb-1">{pedido.mesa_nombre}</h4>
              <p className="text-xs text-[#94A3B8]">#{pedido.id}</p>
            </div>
            {urgency !== 'normal' && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  urgency === 'critical'
                    ? 'bg-[#EF4444] text-white'
                    : 'bg-[#F97316] text-white'
                }`}
              >
                <AlertTriangle size={12} />
                <span className="text-xs">
                  {urgency === 'critical' ? 'Muy urgente' : 'Urgente'}
                </span>
              </div>
            )}
          </div>

          {/* Time */}
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <Clock size={12} />
            <span>{timeSince}</span>
          </div>

          {/* Items */}
          <div className="space-y-1">
            {pedido.lineas.slice(0, isExpanded ? undefined : 2).map((linea) => (
              <div
                key={linea.id}
                className="text-sm text-[#334155] flex justify-between"
              >
                <span>
                  {linea.cantidad}x {linea.producto_nombre}
                </span>
                {linea.notas && (
                  <span className="text-xs text-[#F97316] italic">*</span>
                )}
              </div>
            ))}

            {/* Expand/Collapse */}
            {pedido.lineas.length > 2 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-[#F97316] hover:text-[#EA580C] transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={12} />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} />
                    Ver {pedido.lineas.length - 2} más
                  </>
                )}
              </button>
            )}

            {/* Special notes */}
            {isExpanded && pedido.lineas.some((l) => l.notas) && (
              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                <p className="text-[#64748B] mb-1">Notas especiales:</p>
                {pedido.lineas
                  .filter((l) => l.notas)
                  .map((linea) => (
                    <p key={linea.id} className="text-[#334155]">
                      • {linea.producto_nombre}:{' '}
                      <span className="italic">{linea.notas}</span>
                    </p>
                  ))}
              </div>
            )}

            {/* Order notes */}
            {pedido.notas && (
              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                <p className="text-[#64748B]">Nota del pedido:</p>
                <p className="text-[#334155] italic">{pedido.notas}</p>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="pt-2">{getActionButton()}</div>
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
