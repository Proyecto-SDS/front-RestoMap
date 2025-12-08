import { AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useState } from 'react';
import { Pedido } from '../../screens/cocinero/DashboardCocineroScreen';

interface OrderCardProps {
  pedido: Pedido;
  bgColor: string;
}

export function OrderCard({ pedido, bgColor }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate time since order entered current state
  const getTimeSince = () => {
    const now = new Date();
    // Usar actualizado_el (cuando entró al estado actual) si existe, sino creado_el
    const stateTime = new Date(pedido.actualizado_el || pedido.creado_el);
    const diffMinutes = Math.floor(
      (now.getTime() - stateTime.getTime()) / 60000
    );

    if (diffMinutes < 1) return 'recien';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `hace ${diffHours}h ${diffMinutes % 60}m`;
  };

  // Get urgency level based on time in current state
  const getUrgency = () => {
    const now = new Date();
    // Usar actualizado_el (cuando entró al estado actual) si existe, sino creado_el
    const stateTime = new Date(pedido.actualizado_el || pedido.creado_el);
    const diffMinutes = (now.getTime() - stateTime.getTime()) / 60000;

    if (diffMinutes > 30) return 'critical';
    if (diffMinutes > 15) return 'urgent';
    return 'normal';
  };

  const urgency = getUrgency();
  const timeSince = getTimeSince();

  return (
    <div
      className="rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      style={{ backgroundColor: bgColor }}
    >
      {/* Card Header */}
      <div className="p-4 space-y-3">
        {/* Mesa and urgency */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-[#334155] font-medium mb-1">
              {pedido.mesa_nombre}
            </h4>
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
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
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
                  Ver {pedido.lineas.length - 2} mas
                </>
              )}
            </button>
          )}

          {/* Special notes indicator */}
          {pedido.lineas.some((l) => l.notas) && (
            <p className="text-xs text-[#F97316] italic mt-1">
              * Tiene notas especiales
            </p>
          )}
        </div>

        {/* Tap indicator */}
        <div className="text-center pt-2 border-t border-[#E2E8F0]">
          <span className="text-xs text-[#94A3B8]">Toca para ver detalles</span>
        </div>
      </div>
    </div>
  );
}
