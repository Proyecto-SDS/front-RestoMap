'use client';

import { api } from '@/utils/apiClient';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Receipt,
  Users,
} from 'lucide-react';
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
  debito: 'Debito',
  credito: 'Credito',
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
    });
  };

  const formatearHora = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-CL', {
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
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#64748B]">
          <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando historial...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-[#EF4444] text-sm">{error}</div>
          <button
            onClick={cargarHistorial}
            className="mt-3 text-sm text-[#F97316] hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#64748B]">
        <Receipt className="w-12 h-12 mb-3 text-[#E2E8F0]" />
        <p className="text-sm font-medium">No tienes pedidos completados</p>
        <p className="text-xs mt-1">Tu historial de compras aparecera aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {historial.map((pedido) => {
        const isExpanded = expandedPedido === pedido.pedido_id;

        return (
          <div
            key={pedido.pedido_id}
            className="bg-[#F8FAFC] rounded-xl overflow-hidden border border-[#E2E8F0]"
          >
            {/* Card Header - Compacto */}
            <button
              onClick={() => toggleExpandir(pedido.pedido_id)}
              className="w-full p-4 text-left hover:bg-[#F1F5F9] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left side - Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[#334155] truncate">
                      {pedido.local.nombre}
                    </h3>
                    <span className="shrink-0 text-[10px] bg-[#DCFCE7] text-[#16A34A] px-1.5 py-0.5 rounded-full font-medium">
                      Completado
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatearFecha(pedido.fecha_completado)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Mesa {pedido.mesa.nombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {pedido.num_personas}
                    </span>
                  </div>
                </div>

                {/* Right side - Precio y expand */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-bold text-[#334155]">
                      {formatearPrecio(pedido.total)}
                    </div>
                    {pedido.pago && (
                      <div className="text-[10px] text-[#64748B] flex items-center gap-1 justify-end">
                        <CreditCard className="w-3 h-3" />
                        {metodoPagoLabels[pedido.pago.metodo] ||
                          pedido.pago.metodo}
                      </div>
                    )}
                  </div>
                  <div className="text-[#94A3B8]">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Detalles expandidos */}
            {isExpanded && (
              <div className="border-t border-[#E2E8F0] px-4 py-3 bg-white">
                <div className="text-xs text-[#64748B] mb-2 flex items-center justify-between">
                  <span>Productos ordenados</span>
                  <span className="text-[#94A3B8]">
                    {formatearHora(pedido.fecha_completado)}
                  </span>
                </div>
                <div className="space-y-2">
                  {pedido.productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex items-start justify-between text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[#F97316] font-medium">
                            {producto.cantidad}x
                          </span>
                          <span className="text-[#334155] truncate">
                            {producto.nombre}
                          </span>
                        </div>
                        {producto.observaciones && (
                          <p className="text-xs text-[#94A3B8] ml-6 truncate">
                            {producto.observaciones}
                          </p>
                        )}
                      </div>
                      <div className="text-[#334155] font-medium shrink-0 ml-2">
                        {formatearPrecio(producto.precio * producto.cantidad)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer con QR y direccion */}
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="truncate">{pedido.local.direccion}</span>
                  <span className="shrink-0 ml-2">#{pedido.qr_codigo}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
