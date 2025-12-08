'use client';

import { CheckCircle, ChefHat, Clock } from 'lucide-react';
import { useState } from 'react';
import { Pedido } from '../../screens/cocinero/DashboardCocineroScreen';
import { OrderCard } from './OrderCard';
import { PedidoCarouselModal } from './PedidoCarouselModal';
interface PedidosByEstado {
  tomados: Pedido[];
  en_proceso: Pedido[];
  listos: Pedido[];
}

interface KanbanBoardProps {
  pedidos: PedidosByEstado;
  onPedidoUpdate: (pedido: Pedido) => void;
  onRefresh: () => void;
}

export function KanbanBoard({
  pedidos,
  onPedidoUpdate,
  onRefresh,
}: KanbanBoardProps) {
  const [selectedColumn, setSelectedColumn] = useState<{
    columnId: string;
    initialIndex: number;
  } | null>(null);

  // Track current index for navigation
  const [currentIndex, setCurrentIndex] = useState(0);

  const columns = [
    {
      id: 'tomados',
      title: 'Recepcion',
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
      title: 'Listo',
      pedidos: pedidos.listos,
      color: '#22C55E',
      bgColor: '#F0FDF4',
      icon: CheckCircle,
    },
  ];

  const handleCardClick = (pedido: Pedido, columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    const index = column.pedidos.findIndex((p) => p.id === pedido.id);
    setSelectedColumn({ columnId, initialIndex: index >= 0 ? index : 0 });
    setCurrentIndex(index >= 0 ? index : 0);
  };

  const handleCloseModal = () => {
    setSelectedColumn(null);
    setCurrentIndex(0);
  };

  const handleNavigate = (newIndex: number) => {
    setCurrentIndex(newIndex);
  };

  const getColumnData = () => {
    if (!selectedColumn) return { pedidos: [], title: '' };
    const column = columns.find((c) => c.id === selectedColumn.columnId);
    return {
      pedidos: column?.pedidos || [],
      title: column?.title || '',
    };
  };

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

      {/* Kanban Columns - 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <h3 className="text-white font-medium">{column.title}</h3>
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
                    <div
                      key={pedido.id}
                      onClick={() => handleCardClick(pedido, column.id)}
                      className="cursor-pointer"
                    >
                      <OrderCard pedido={pedido} bgColor={column.bgColor} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Carrusel */}
      {selectedColumn && getColumnData().pedidos.length > 0 && (
        <PedidoCarouselModal
          pedidos={getColumnData().pedidos}
          currentIndex={currentIndex}
          columnTitle={getColumnData().title}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
          onUpdate={(updatedPedido: Pedido) => {
            onPedidoUpdate(updatedPedido);
            onRefresh();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}
