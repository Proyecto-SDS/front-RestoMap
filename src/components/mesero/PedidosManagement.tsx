import { CheckCircle, ChefHat, Clock, DollarSign, X } from 'lucide-react';
import { useState } from 'react';
import { Mesa, Pedido, PedidoEstado } from '../../screens/mesero/DashboardMeseroScreen';
import { PedidoDetailModal } from './PedidoDetailModal';

interface PedidosManagementProps {
  pedidos: Pedido[];
  mesas?: Mesa[];
  onPedidoUpdate: (pedido: Pedido) => void;
  onRefresh?: () => void | Promise<void>;
}

export function PedidosManagement({ pedidos, onPedidoUpdate }: PedidosManagementProps) {
  const [filterEstado, setFilterEstado] = useState<PedidoEstado | 'TODOS'>('TODOS');
  const [sortBy, setSortBy] = useState<'reciente' | 'mesa' | 'total'>('reciente');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  // Get status info
  const getStatusInfo = (estado: PedidoEstado) => {
    const statusMap = {
      TOMADO: { label: 'Tomado', color: '#3B82F6', icon: Clock },
      EN_COCINA: { label: 'En Cocina', color: '#8B5CF6', icon: ChefHat },
      LISTO: { label: 'Listo', color: '#FBBF24', icon: CheckCircle },
      ENTREGADO: { label: 'Entregado', color: '#22C55E', icon: CheckCircle },
      PAGADO: { label: 'Pagado', color: '#94A3B8', icon: DollarSign },
      CANCELADO: { label: 'Cancelado', color: '#EF4444', icon: X },
    };
    return statusMap[estado];
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'recién';
    if (diffMins < 60) return `hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${Math.floor(diffHours / 24)}d`;
  };

  // Filter and sort pedidos
  const filteredPedidos = pedidos
    .filter(p => filterEstado === 'TODOS' || p.estado === filterEstado)
    .sort((a, b) => {
      if (sortBy === 'reciente') {
        return new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime();
      } else if (sortBy === 'mesa') {
        return (a.mesa_nombre || '').localeCompare(b.mesa_nombre || '');
      } else {
        return b.total - a.total;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#334155] mb-2">Mis Pedidos</h1>
        <p className="text-[#64748B]">Gestiona todos los pedidos del establecimiento</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status filter */}
          <div className="flex-1">
            <label className="block text-sm text-[#64748B] mb-2">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as PedidoEstado | 'TODOS')}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="TOMADO">Tomados</option>
              <option value="EN_COCINA">En Cocina</option>
              <option value="LISTO">Listos</option>
              <option value="ENTREGADO">Entregados</option>
              <option value="PAGADO">Pagados</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>

          {/* Sort filter */}
          <div className="flex-1">
            <label className="block text-sm text-[#64748B] mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'reciente' | 'mesa' | 'total')}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
            >
              <option value="reciente">Más recientes</option>
              <option value="mesa">Por mesa</option>
              <option value="total">Por total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredPedidos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
            <p className="text-[#94A3B8]">No hay pedidos que mostrar</p>
          </div>
        ) : (
          filteredPedidos.map((pedido) => {
            const statusInfo = getStatusInfo(pedido.estado);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={pedido.id}
                className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPedido(pedido)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Order info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[#334155]">
                        Orden #{pedido.id}
                      </h3>
                      <div
                        className="px-2 py-1 rounded-lg text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: `${statusInfo.color}20`,
                          color: statusInfo.color,
                        }}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTimeAgo(pedido.creado_el)}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F1F5F9] rounded">
                        {pedido.mesa_nombre}
                      </span>
                      {pedido.usuario_nombre && (
                        <span>{pedido.usuario_nombre}</span>
                      )}
                    </div>

                    {/* Items preview */}
                    {pedido.lineas && pedido.lineas.length > 0 && (
                      <div className="mt-2 text-sm text-[#64748B]">
                        {pedido.lineas.slice(0, 2).map((linea, idx) => (
                          <span key={linea.id}>
                            {idx > 0 && ', '}
                            {linea.cantidad}x {linea.producto_nombre}
                          </span>
                        ))}
                        {pedido.lineas.length > 2 && (
                          <span> y {pedido.lineas.length - 2} más</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Total and actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-[#94A3B8] mb-1">Total</p>
                      <p className="text-xl text-[#F97316]">
                        {formatCurrency(pedido.total)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPedido(pedido);
                      }}
                      className="px-4 py-2 text-sm text-[#F97316] hover:bg-[#F97316] hover:text-white border border-[#F97316] rounded-lg transition-colors"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pedido Detail Modal */}
      {selectedPedido && (
        <PedidoDetailModal
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
          onUpdate={onPedidoUpdate}
        />
      )}
    </div>
  );
}
