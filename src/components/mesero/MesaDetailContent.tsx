'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  DollarSign,
  QrCode,
  ShoppingBag,
  Users,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
  lineas: LineaPedido[];
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
  const [qrData, setQrData] = useState<{
    url: string;
    mesa_nombre: string;
  } | null>(null);

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

  const handleGenerarQR = async () => {
    try {
      const data = await api.empresa.generarQRMesa(Number(mesaId));
      // Construir URL completa para el escaneo (frontend URL + ruta)
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/pedido?qr=${data.qr.codigo}`;
      setQrData({
        url: qrUrl,
        mesa_nombre: mesa?.nombre || '',
      });
      setShowQRModal(true);
    } catch (err) {
      console.error('Error generating QR:', err);
      alert('Error al generar código QR');
    }
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

          {/* Action Buttons - Solo si no es readOnly */}
          {!readOnly && isOcupada && (
            <div className="flex gap-3">
              <DangerButton onClick={() => setShowCancelarModal(true)}>
                <XCircle size={16} />
                Cancelar Mesa
              </DangerButton>
            </div>
          )}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#334155] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#F97316]" />
                Pedido Activo #{mesa.pedido_activo.id}
              </h2>
              <span className="text-sm text-[#64748B] flex items-center gap-1">
                <Clock size={14} />
                {formatDate(mesa.pedido_activo.creado_el)}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-50 text-[#F97316]">
                {mesa.pedido_activo.estado.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Líneas del Pedido */}
            <div className="border-t border-[#E2E8F0] pt-4">
              <h3 className="text-sm text-[#64748B] mb-3">
                Productos del Pedido:
              </h3>
              <div className="space-y-3">
                {mesa.pedido_activo.lineas.map((linea) => (
                  <div
                    key={linea.id}
                    className="flex items-center justify-between py-3 px-4 bg-[#F8FAFC] rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-[#334155]">{linea.producto_nombre}</p>
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
                        {formatCurrency(linea.precio_unitario * linea.cantidad)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

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
              <h3 className="text-sm text-[#64748B] mb-4">Acciones de Mesa</h3>
              <div className="flex gap-3">
                <DangerButton onClick={() => setShowCancelarModal(true)}>
                  <XCircle size={16} />
                  Cancelar Mesa y Pedido
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
          <p className="text-[#64748B] mb-6">
            El cliente ha escaneado el QR pero aún no ha realizado ningún
            pedido.
          </p>
          {!readOnly && (
            <DangerButton onClick={() => setShowCancelarModal(true)}>
              <XCircle size={16} />
              Cancelar Mesa
            </DangerButton>
          )}
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
      {showQRModal && qrData && (
        <QRGenerateModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrUrl={qrData.url}
          mesaNombre={qrData.mesa_nombre}
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
