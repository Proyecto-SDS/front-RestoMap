import { CheckCircle, ChefHat, Clock, Package } from 'lucide-react';
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
  const columns = [
    {
      id: 'tomados',
      title: 'Tomados',
      pedidos: pedidos.tomados,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      icon: Clock,
    },
    {
      id: 'en_proceso',
      title: 'En Proceso',
      pedidos: pedidos.en_proceso,
      color: '#F97316',
      bgColor: '#FEF3C7',
      icon: ChefHat,
    },
    {
      id: 'listos',
      title: 'Listos',
      pedidos: pedidos.listos,
      color: '#22C55E',
      bgColor: '#F0FDF4',
      icon: CheckCircle,
    },
    {
      id: 'entregados',
      title: 'Entregados',
      pedidos: pedidos.entregados,
      color: '#94A3B8',
      bgColor: '#F3F4F6',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <h4 className="text-sm text-[#334155] mb-2">
          Indicadores de urgencia:
        </h4>
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
                  <span className="text-xs text-white">
                    {column.pedidos.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-4 rounded-b-xl bg-white border-x border-b border-[#E2E8F0] overflow-y-auto space-y-3">
                {column.pedidos.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-center">
                    <p className="text-sm text-[#94A3B8]">No hay pedidos</p>
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
    </div>
  );
}
