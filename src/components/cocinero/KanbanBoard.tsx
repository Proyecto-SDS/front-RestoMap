
import { CheckCircle, ChefHat, Clock, Package } from 'lucide-react';
import { useState } from 'react';
import { Pedido } from '../../screens/cocinero/DashboardCocineroScreen';
import { OrderCard } from './OrderCard';

interface PedidosByEstado {
  tomados: Pedido[];
  en_proceso: Pedido[];
  listos: Pedido[];
  entregados: Pedido[];
}

interface KanbanBoardProps {
  pedidos: PedidosByEstado;
  onPedidoUpdate: (pedido: Pedido) => void;
  onRefresh: () => void;
}

export function KanbanBoard({ pedidos, onPedidoUpdate }: KanbanBoardProps) {
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');

  // Check if order is urgent (>15min)
  const isUrgent = (pedido: Pedido) => {
    const now = new Date();
    const created = new Date(pedido.creado_el);
    const diffMinutes = (now.getTime() - created.getTime()) / 60000;
    return diffMinutes > 15;
  };

  // Filter pedidos based on selected filter
  const filterPedidos = (pedidoList: Pedido[]) => {
    if (filter === 'urgent') {
      return pedidoList.filter(p => isUrgent(p));
    }
    return pedidoList;
  };

  const columns = [
    {
      id: 'tomados',
      title: 'Tomados',
      pedidos: filterPedidos(pedidos.tomados),
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      icon: Clock,
    },
    {
      id: 'en_proceso',
      title: 'En Proceso',
      pedidos: filterPedidos(pedidos.en_proceso),
      color: '#F97316',
      bgColor: '#FEF3C7',
      icon: ChefHat,
    },
    {
      id: 'listos',
      title: 'Listos',
      pedidos: filterPedidos(pedidos.listos),
      color: '#22C55E',
      bgColor: '#F0FDF4',
      icon: CheckCircle,
    },
    {
      id: 'entregados',
      title: 'Entregados',
      pedidos: filterPedidos(pedidos.entregados),
      color: '#94A3B8',
      bgColor: '#F3F4F6',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-[#334155] mb-2">Pedidos en Cocina</h1>
          <p className="text-[#64748B]">Gestiona el flujo de pedidos en tiempo real</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-[#F97316] text-white'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#F97316]'
            }`}
          >
            Mostrar todo
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              filter === 'urgent'
                ? 'bg-[#EF4444] text-white'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#EF4444]'
            }`}
          >
            Solo urgentes
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          
          return (
            <div key={column.id} className="flex flex-col min-h-[600px]">
              {/* Column Header */}
              <div
                className="p-4 rounded-t-xl flex items-center justify-between"
                style={{ backgroundColor: column.color }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={20} className="text-white" />
                  <h3 className="text-white">{column.title}</h3>
                </div>
                <div className="px-2 py-1 bg-white/20 rounded-lg">
                  <span className="text-xs text-white">{column.pedidos.length}</span>
                </div>
              </div>

              {/* Column Content */}
              <div
                className="flex-1 p-4 rounded-b-xl bg-white border-x border-b border-[#E2E8F0] overflow-y-auto space-y-3"
              >
                {column.pedidos.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-center">
                    <p className="text-sm text-[#94A3B8]">
                      {filter === 'urgent' ? 'No hay pedidos urgentes' : 'No hay pedidos'}
                    </p>
                  </div>
                ) : (
                  column.pedidos.map((pedido) => (
                    <OrderCard
                      key={pedido.id}
                      pedido={pedido}
                      bgColor={column.bgColor}
                      onUpdate={onPedidoUpdate}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <h4 className="text-sm text-[#334155] mb-2">Indicadores de urgencia:</h4>
        <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
            <span>&gt; 15 minutos (urgente)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
            <span>&gt; 30 minutos (muy urgente)</span>
          </div>
        </div>
      </div>
    </div>
  );
}