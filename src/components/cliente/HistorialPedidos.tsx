'use client';

import { api } from '@/utils/apiClient';
import { Calendar, CreditCard, MapPin, Receipt, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface PedidoHistorial {
  pedido_id: number;
  qr_codigo: string;
  fecha: string;
  fecha_completado: string;
  total: number;
  num_personas: number;
  mesa: {
    id: number;
    nombre: string;
  };
  local: {
    id: number;
    nombre: string;
    direccion: string;
  };
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

export default function HistorialPedidos() {
  const [historial, setHistorial] = useState<PedidoHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPedido, setExpandedPedido] = useState<number | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await api.cliente.getHistorial();
      setHistorial(response.historial || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de pedidos');
    } finally {
      setLoading(false);
    }
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

  if (historial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Receipt className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No tienes pedidos completados</p>
        <p className="text-sm">Tu historial de compras aparecerá aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Historial de Pedidos
      </h2>

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
                        {pedido.local.nombre}
                      </h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completado
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatearFecha(pedido.fecha_completado)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          Mesa {pedido.mesa.nombre} • {pedido.local.direccion}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{pedido.num_personas} persona(s)</span>
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
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Productos ordenados:
                  </h4>
                  <div className="space-y-2">
                    {pedido.productos.map((producto) => (
                      <div
                        key={producto.id}
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
                          {formatearPrecio(producto.precio * producto.cantidad)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {pedido.pago && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Pagado el {formatearFecha(pedido.pago.fecha)}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          Total: {formatearPrecio(pedido.pago.monto)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
