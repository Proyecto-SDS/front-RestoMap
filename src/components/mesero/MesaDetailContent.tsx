'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  DollarSign,
  Plus,
  QrCode,
  ShoppingBag,
  Users,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../utils/apiClient';
import { DangerButton } from '../buttons/DangerButton';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { CancelarMesaModal } from './CancelarMesaModal';
import { QRGenerateModal } from './QRGenerateModal';

interface MesaDetail {
  id: number;
  nombre: string;
  capacidad: number;
  estado: string;
  pedido_activo?: PedidoActivo | null;
  qr_activo?: QRActivo | null;
}

interface PedidoActivo {
  id: number;
  estado: string;
  total: number;
  creado_el: string;
  expiracion?: string;
  lineas: LineaPedido[];
  cliente?: {
    id: number;
    nombre: string;
    email: string;
  };
  encomiendas?: EncomiendaMesero[];
}

interface EncomiendaMesero {
  id: number;
  estado: string;
  nombre: string;
  items: EncomiendaItem[];
  creado_el: string;
}

interface EncomiendaItem {
  id: number;
  producto: string;
  cantidad: number;
  precio_unitario: number;
  observaciones?: string;
}

interface LineaPedido {
  id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  observaciones?: string;
}

interface QRActivo {
  codigo: string;
  expiracion: string;
  url: string;
}

interface MesaDetailContentProps {
  mesaId: string;
  onVolver: () => void;
  readOnly?: boolean;
}

const estadoConfig: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  disponible: {
    color: '#22C55E',
    bgColor: 'bg-green-50',
    label: 'Disponible',
  },
  reservada: {
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    label: 'Reservada',
  },
  ocupada: {
    color: '#F97316',
    bgColor: 'bg-orange-50',
    label: 'Ocupada',
  },
  fuera_de_servicio: {
    color: '#94A3B8',
    bgColor: 'bg-slate-50',
    label: 'Fuera de Servicio',
  },
};

export function MesaDetailContent({
  mesaId,
  onVolver,
  readOnly = false,
}: MesaDetailContentProps) {
  const [mesa, setMesa] = useState<MesaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<string | null>(null);
  const [tiempoUrgente, setTiempoUrgente] = useState(false);
  const [extendiendo, setExtendiendo] = useState(false);

  const loadMesaDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.empresa.getMesaDetalle(Number(mesaId));
      setMesa(data);
    } catch (err) {
      console.error('Error loading mesa detail:', err);
      setError('No se pudo cargar la información de la mesa');
    } finally {
      setLoading(false);
    }
  }, [mesaId]);

  useEffect(() => {
    loadMesaDetail();
  }, [loadMesaDetail]);

  // Suscribirse a eventos WebSocket para actualizar automáticamente
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket || !mesa) return;

    const handleActualizar = (data?: { mesa_id?: number }) => {
      // Si el evento es para esta mesa en particular, o si es general, recargar
      if (!data || !data.mesa_id || data.mesa_id === Number(mesaId)) {
        console.log('[WS MesaDetail] Actualizando detalle...', data);
        loadMesaDetail();
      }
    };

    socket.on('nueva_encomienda', handleActualizar);
    socket.on('estado_encomienda', handleActualizar);
    socket.on('estado_pedido', handleActualizar);
    socket.on('nuevo_pedido', handleActualizar);
    socket.on('qr_escaneado', handleActualizar); // Cuando cliente escanea QR
    socket.on('mesa_actualizada', handleActualizar); // Cuando mesa cambia de estado

    return () => {
      socket.off('nueva_encomienda', handleActualizar);
      socket.off('estado_encomienda', handleActualizar);
      socket.off('estado_pedido', handleActualizar);
      socket.off('nuevo_pedido', handleActualizar);
      socket.off('qr_escaneado', handleActualizar);
      socket.off('mesa_actualizada', handleActualizar);
    };
  }, [socket, mesa, mesaId, loadMesaDetail]);

  const handleGenerarQR = async () => {
    // Abrir el modal - el modal se encargará de llamar a la API
    setShowQRModal(true);
  };

  const handleCancelarMesa = async () => {
    try {
      await api.empresa.cancelarMesa(Number(mesaId));
      setShowCancelarModal(false);
      loadMesaDetail();
    } catch (err) {
      console.error('Error canceling mesa:', err);
      alert('Error al cancelar la mesa');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcular tiempo restante
  useEffect(() => {
    if (!mesa?.pedido_activo?.expiracion) {
      setTiempoRestante(null);
      return;
    }

    const calcular = () => {
      const ahora = new Date();
      const exp = new Date(mesa.pedido_activo!.expiracion!);
      const diffMs = exp.getTime() - ahora.getTime();

      if (diffMs <= 0) {
        setTiempoRestante('Expirado');
        setTiempoUrgente(true);
        return;
      }

      const minutos = Math.floor(diffMs / 60000);
      const segundos = Math.floor((diffMs % 60000) / 1000);

      if (minutos >= 60) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        setTiempoRestante(`${horas}h ${mins}m`);
        setTiempoUrgente(false);
      } else if (minutos <= 10) {
        setTiempoRestante(`${minutos}:${segundos.toString().padStart(2, '0')}`);
        setTiempoUrgente(true);
      } else {
        setTiempoRestante(`${minutos} min`);
        setTiempoUrgente(minutos <= 15);
      }
    };

    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Solo recalcular cuando cambia expiracion
  }, [mesa?.pedido_activo?.expiracion]);

  // Extender tiempo
  const handleExtenderTiempo = async (minutos: number) => {
    if (!mesa?.pedido_activo) return;
    setExtendiendo(true);
    try {
      await api.empresa.extenderTiempoPedido(mesa.pedido_activo.id, minutos);
      loadMesaDetail();
    } catch (err) {
      console.error('Error extendiendo tiempo:', err);
      alert('Error al extender tiempo');
    } finally {
      setExtendiendo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  if (error || !mesa) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
        <AlertTriangle size={48} className="text-[#F97316] mx-auto mb-4" />
        <h2 className="text-xl text-[#334155] mb-2">Error</h2>
        <p className="text-[#64748B] mb-6">{error || 'Mesa no encontrada'}</p>
        <SecondaryButton onClick={onVolver}>
          <ArrowLeft size={16} />
          Volver a Mesas
        </SecondaryButton>
      </div>
    );
  }

  const config =
    estadoConfig[mesa.estado.toLowerCase()] || estadoConfig.disponible;
  const isOcupada = mesa.estado.toLowerCase() === 'ocupada';
  const isDisponible = mesa.estado.toLowerCase() === 'disponible';

  return (
    <div className="space-y-6">
      {/* Header con boton volver */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onVolver}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-[#64748B]" />
            </button>
            <div>
              <h1 className="text-2xl text-[#334155]">{mesa.nombre}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${config.bgColor}`}
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
                <span className="text-sm text-[#64748B] flex items-center gap-1">
                  <Users size={14} />
                  {mesa.capacidad} personas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Mesa Disponible */}
      {isDisponible && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <QrCode size={40} style={{ color: config.color }} />
          </div>
          <h2 className="text-xl text-[#334155] mb-2">Mesa Disponible</h2>
          <p className="text-[#64748B] mb-6">
            {readOnly
              ? 'Esta mesa está disponible para atender clientes.'
              : 'Genera un código QR para que el cliente pueda realizar pedidos desde su dispositivo.'}
          </p>
          {!readOnly && (
            <PrimaryButton onClick={handleGenerarQR} size="lg">
              <QrCode size={20} />
              Generar Código QR
            </PrimaryButton>
          )}
        </div>
      )}

      {/* Estado de Mesa Ocupada - Vista de Pedido */}
      {isOcupada && mesa.pedido_activo && (
        <>
          {/* Info del Pedido */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-[#334155] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#F97316]" />
                Pedido Activo #{mesa.pedido_activo.id}
              </h2>
              <span className="text-sm text-[#64748B] flex items-center gap-1">
                <Clock size={14} />
                {formatDate(mesa.pedido_activo.creado_el)}
              </span>
            </div>
          </div>

          {/* Info Cliente */}
          {mesa.pedido_activo.cliente && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {mesa.pedido_activo.cliente.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#1E293B]">
                  {mesa.pedido_activo.cliente.nombre}
                </p>
                <p className="text-sm text-[#64748B]">
                  {mesa.pedido_activo.cliente.email}
                </p>
              </div>
            </div>
          )}

          <div className="p-6 pt-0">
            <div className="flex items-center gap-2 mb-4 mt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-50 text-[#F97316]">
                {mesa.pedido_activo.estado.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Encomiendas del Pedido */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-4">
              {mesa.pedido_activo.encomiendas &&
              mesa.pedido_activo.encomiendas.length > 0 ? (
                mesa.pedido_activo.encomiendas.map((enc) => (
                  <div
                    key={enc.id}
                    className="bg-[#F8FAFC] rounded-lg overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
                      <span className="font-medium text-sm text-[#334155]">
                        {enc.nombre}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            enc.estado === 'listo'
                              ? '#DCFCE7'
                              : enc.estado === 'en_proceso'
                              ? '#FEF3C7'
                              : '#F1F5F9',
                          color:
                            enc.estado === 'listo'
                              ? '#16A34A'
                              : enc.estado === 'en_proceso'
                              ? '#D97706'
                              : '#64748B',
                        }}
                      >
                        {enc.estado?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      {enc.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="text-[#334155]">{item.producto}</p>
                            {item.observaciones && (
                              <p className="text-xs text-[#94A3B8]">
                                Nota: {item.observaciones}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[#64748B]">
                              x{item.cantidad}
                            </span>
                            <span className="text-[#334155] w-20 text-right">
                              {formatCurrency(
                                item.precio_unitario * item.cantidad
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  {mesa.pedido_activo.lineas.map((linea) => (
                    <div
                      key={linea.id}
                      className="flex items-center justify-between py-3 px-4 bg-[#F8FAFC] rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-[#334155]">
                          {linea.producto_nombre}
                        </p>
                        {linea.observaciones && (
                          <p className="text-xs text-[#94A3B8] mt-1">
                            Nota: {linea.observaciones}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[#64748B] text-sm">
                          x{linea.cantidad}
                        </span>
                        <span className="text-[#334155] w-24 text-right">
                          {formatCurrency(
                            linea.precio_unitario * linea.cantidad
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0]">
                <span className="text-lg text-[#334155] flex items-center gap-2">
                  <DollarSign size={20} className="text-[#22C55E]" />
                  Total
                </span>
                <span className="text-2xl text-[#334155]">
                  {formatCurrency(mesa.pedido_activo.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones - Solo si no es readOnly */}
          {!readOnly && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h3 className="text-sm text-[#64748B] mb-4">Acciones</h3>

              {/* Tiempo restante y botones extender */}
              {tiempoRestante && (
                <div className="mb-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#64748B] flex items-center gap-2">
                      <Clock size={16} />
                      Tiempo restante:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        tiempoUrgente ? 'text-red-500' : 'text-[#334155]'
                      }`}
                    >
                      {tiempoRestante}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExtenderTiempo(5)}
                      disabled={extendiendo}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <Plus size={14} />5 min
                    </button>
                    <button
                      onClick={() => handleExtenderTiempo(10)}
                      disabled={extendiendo}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <Plus size={14} />
                      10 min
                    </button>
                    <button
                      onClick={() => handleExtenderTiempo(15)}
                      disabled={extendiendo}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <Plus size={14} />
                      15 min
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <DangerButton onClick={() => setShowCancelarModal(true)}>
                  <XCircle size={16} />
                  Cancelar Pedido
                </DangerButton>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mesa ocupada sin pedido activo */}
      {isOcupada && !mesa.pedido_activo && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Clock size={40} className="text-[#F97316]" />
          </div>
          <h2 className="text-xl text-[#334155] mb-2">Esperando Pedido</h2>
          <p className="text-[#64748B]">
            El cliente ha escaneado el QR pero aún no ha realizado ningún
            pedido.
          </p>
        </div>
      )}

      {/* Mesa Reservada */}
      {mesa.estado.toLowerCase() === 'reservada' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Clock size={40} className="text-[#3B82F6]" />
          </div>
          <h2 className="text-xl text-[#334155] mb-2">Mesa Reservada</h2>
          <p className="text-[#64748B]">
            Esta mesa tiene una reserva activa. Espera a que el cliente llegue.
          </p>
        </div>
      )}

      {/* Mesa Fuera de Servicio */}
      {mesa.estado.toLowerCase() === 'fuera_de_servicio' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={40} className="text-[#94A3B8]" />
          </div>
          <h2 className="text-xl text-[#334155] mb-2">Fuera de Servicio</h2>
          <p className="text-[#64748B]">
            Esta mesa no está disponible actualmente.
          </p>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && mesa && (
        <QRGenerateModal
          mesa={{
            id: mesa.id.toString(),
            id_empresa: '1',
            nombre: mesa.nombre,
            capacidad: mesa.capacidad,
            descripcion: '',
            estado: mesa.estado.toUpperCase() as
              | 'DISPONIBLE'
              | 'OCUPADA'
              | 'RESERVADA'
              | 'FUERA_DE_SERVICIO',
            orden: 0,
          }}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Cancelar Modal */}
      {showCancelarModal && (
        <CancelarMesaModal
          isOpen={showCancelarModal}
          onClose={() => setShowCancelarModal(false)}
          onConfirm={handleCancelarMesa}
          mesaNombre={mesa.nombre}
          hasPedido={!!mesa.pedido_activo}
        />
      )}
    </div>
  );
}
