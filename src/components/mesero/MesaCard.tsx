import React from 'react';
import { Users, ShoppingBag } from 'lucide-react';
import type { Mesa, MesaEstado } from '../../screens/mesero/DashboardMeseroScreen';

interface MesaCardProps {
  mesa: Mesa;
  onClick: () => void;
}

const estadoConfig: Record<MesaEstado, { color: string; bgColor: string; label: string; shape: string }> = {
  DISPONIBLE: {
    color: '#22C55E',
    bgColor: 'bg-green-50',
    label: 'Disponible',
    shape: 'rounded-full'
  },
  OCUPADA: {
    color: '#F97316',
    bgColor: 'bg-orange-50',
    label: 'Ocupada',
    shape: 'rounded-lg'
  },
  PIDIENDO: {
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    label: 'Pidiendo',
    shape: 'rounded-full'
  },
  EN_COCINA: {
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    label: 'En Cocina',
    shape: 'rounded-full'
  },
  COMIENDO: {
    color: '#FBBF24',
    bgColor: 'bg-yellow-50',
    label: 'Comiendo',
    shape: 'rounded-full'
  },
  PIDIENDO_CUENTA: {
    color: '#EF4444',
    bgColor: 'bg-red-50',
    label: 'Pidiendo Cuenta',
    shape: 'rounded-full'
  },
  PAGADO: {
    color: '#94A3B8',
    bgColor: 'bg-slate-50',
    label: 'Pagado',
    shape: 'rounded-full'
  }
};

export function MesaCard({ mesa, onClick }: MesaCardProps) {
  const config = estadoConfig[mesa.estado];

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full bg-white rounded-xl shadow-sm border-2 p-6
        transition-all duration-200 hover:shadow-lg hover:-translate-y-1
        text-left
      `}
      style={{ borderColor: config.color }}
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-3 h-3 ${config.shape}`}
          style={{ backgroundColor: config.color }}
        ></div>
      </div>

      {/* Mesa Name */}
      <h3 className="text-xl text-[#334155] mb-4">{mesa.nombre}</h3>

      {/* Info Grid */}
      <div className="space-y-3">
        {/* Capacity */}
        <div className="flex items-center gap-2 text-[#64748B]">
          <Users size={16} />
          <span className="text-sm">{mesa.capacidad} personas</span>
        </div>

        {/* Orders Count */}
        {mesa.pedidos_count !== undefined && mesa.pedidos_count > 0 && (
          <div className="flex items-center gap-2 text-[#64748B]">
            <ShoppingBag size={16} />
            <span className="text-sm">
              {mesa.pedidos_count} {mesa.pedidos_count === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${config.bgColor}`}
          style={{ color: config.color }}
        >
          {config.label}
        </div>
      </div>
    </button>
  );
}
