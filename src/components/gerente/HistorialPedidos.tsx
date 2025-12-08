'use client';

import { api } from '@/utils/apiClient';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Filter,
  Receipt,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  observaciones: string | null;
}

interface Pago {
  metodo: string;
  monto: number;
  estado: string;
  fecha: string;
}

interface Cliente {
  id: number;
  nombre: string;
  correo: string;
}

interface PedidoHistorial {
  pedido_id: number;
  qr_codigo: string;
  estado: string;
  fecha_creacion: string;
  fecha_completado: string;
  total: number;
  num_personas: number;
  mesa: {
    id: number;
    nombre: string;
  };
  cliente: Cliente;
  productos: Producto[];
  pago: Pago | null;
}

const metodoPagoLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  debito: 'Débito',
  credito: 'Crédito',
  app_de_pago: 'App de Pago',
  otro: 'Otro',
};

const estadoLabels: Record<string, string> = {
  completado: 'Completado',
  cancelado: 'Cancelado',
};

const estadoColors: Record<string, string> = {
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export default function HistorialPedidosEmpresa() {
  const [historial, setHistorial] = useState<PedidoHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPedido, setExpandedPedido] = useState<number | null>(null);

  // Filtros
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const cargarHistorial = useCallback(async () => {
    try {
      setLoading(true);
      const params: {
        estado?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
      } = {};

      if (estadoFilter) params.estado = estadoFilter;
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;

      const response = await api.empresa.getHistorial(params);
      setHistorial(response.historial || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError(
        (err as Error).message || 'No se pudo cargar el historial de pedidos'
      );
    } finally {
      setLoading(false);
    }
  }, [estadoFilter, fechaDesde, fechaHasta]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const limpiarFiltros = () => {
    setEstadoFilter('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(precio);
  };

  const toggleExpandir = (pedidoId: number) => {
    setExpandedPedido(expandedPedido === pedidoId ? null : pedidoId);
  };

  const hayFiltrosActivos = estadoFilter || fechaDesde || fechaHasta;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Historial de Pedidos
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="completado">Completados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>

              {/* Filtro fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Filtro fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Resumen */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Total de registros:{' '}
            <span className="font-semibold">{historial.length}</span>
          </p>
        </div>
      </div>

      {/* Lista de pedidos */}
      {historial.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 bg-white rounded-lg shadow-md p-8">
          <Receipt className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay pedidos en el historial</p>
          <p className="text-sm">
            {hayFiltrosActivos
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Los pedidos completados aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historial.map((pedido) => {
            const isExpanded = expandedPedido === pedido.pedido_id;

            return (
              <div
                key={pedido.pedido_id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                {/* Header del pedido */}
                <button
                  onClick={() => toggleExpandir(pedido.pedido_id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Mesa {pedido.mesa.nombre}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            estadoColors[pedido.estado] ||
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {estadoLabels[pedido.estado] || pedido.estado}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatearFecha(pedido.fecha_completado)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{pedido.num_personas} persona(s)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Cliente:</span>
                          <span className="font-medium">
                            {pedido.cliente.nombre}
                          </span>
                        </div>
                        {pedido.pago && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>
                              {metodoPagoLabels[pedido.pago.metodo] ||
                                pedido.pago.metodo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatearPrecio(pedido.total)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        QR: {pedido.qr_codigo}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Detalles expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Productos */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Productos ordenados:
                        </h4>
                        <div className="space-y-2">
                          {pedido.productos.map((producto, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between py-2 border-b border-gray-200 last:border-0"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {producto.cantidad}x
                                  </span>
                                  <span className="text-gray-800">
                                    {producto.nombre}
                                  </span>
                                </div>
                                {producto.observaciones && (
                                  <p className="text-sm text-gray-500 mt-1 ml-8">
                                    Nota: {producto.observaciones}
                                  </p>
                                )}
                              </div>
                              <div className="text-gray-900 font-medium ml-4">
                                {formatearPrecio(
                                  producto.precio * producto.cantidad
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Información del cliente:
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Nombre:</span>{' '}
                              {pedido.cliente.nombre}
                            </p>
                            <p>
                              <span className="font-medium">Correo:</span>{' '}
                              {pedido.cliente.correo}
                            </p>
                          </div>
                        </div>

                        {pedido.pago && (
                          <div className="pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Información de pago:
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Método:</span>{' '}
                                {metodoPagoLabels[pedido.pago.metodo] ||
                                  pedido.pago.metodo}
                              </p>
                              <p>
                                <span className="font-medium">Fecha:</span>{' '}
                                {formatearFecha(pedido.pago.fecha)}
                              </p>
                              <p className="pt-2 text-base">
                                <span className="font-medium">
                                  Total pagado:
                                </span>{' '}
                                <span className="font-bold text-gray-900">
                                  {formatearPrecio(pedido.pago.monto)}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                          <p>
                            Pedido creado:{' '}
                            {formatearFecha(pedido.fecha_creacion)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
