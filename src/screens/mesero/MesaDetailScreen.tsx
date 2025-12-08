'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChefHat,
  Circle,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  QrCode,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DangerButton } from '../../components/buttons/DangerButton';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { CancelarMesaModal } from '../../components/mesero/CancelarMesaModal';
import { ConfirmarPagoModal } from '../../components/mesero/ConfirmarPagoModal';
import { QRGenerateModal } from '../../components/mesero/QRGenerateModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiClient';

interface MesaDetail {
  id: string;
  nombre: string;
  capacidad: number;
  estado: string;
  id_empresa?: string;
  orden?: number;
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

interface MesaDetailScreenProps {
  mesaId: string;
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

export default function MesaDetailScreen({ mesaId }: MesaDetailScreenProps) {
  const router = useRouter();
  const { isLoggedIn, userType } = useAuth();
  const [mesa, setMesa] = useState<MesaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [marcarServidoLoading, setMarcarServidoLoading] = useState(false);
  const [marcarCompletadoLoading, setMarcarCompletadoLoading] = useState(false);
  const [showConfirmarPagoModal, setShowConfirmarPagoModal] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
    }
  }, [isLoggedIn, userType, router]);

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

  const handleMarcarServido = async () => {
    if (!mesa?.pedido_activo) return;

    try {
      setMarcarServidoLoading(true);
      await api.empresa.updatePedidoEstado(mesa.pedido_activo.id, 'servido');
      // Recargar los datos de la mesa
      await loadMesaDetail();
    } catch (err) {
      console.error('Error al marcar pedido como servido:', err);
      alert('Error al marcar el pedido como servido');
    } finally {
      setMarcarServidoLoading(false);
    }
  };

  const handleMarcarCompletado = async (metodoPago: string) => {
    if (!mesa?.pedido_activo) return;

    try {
      setMarcarCompletadoLoading(true);
      // Registrar pago con el método seleccionado
      await api.empresa.registrarPago(
        mesa.pedido_activo.id,
        metodoPago,
        mesa.pedido_activo.total
      );
      // Marcar pedido como completado
      await api.empresa.updatePedidoEstado(mesa.pedido_activo.id, 'completado');
      setShowConfirmarPagoModal(false);
      // Volver a la vista anterior (dashboard)
      router.push('/dashboard-mesero');
    } catch (err) {
      console.error('Error al registrar el pago:', err);
      alert('Error al registrar el pago');
    } finally {
      setMarcarCompletadoLoading(false);
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
      <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  if (error || !mesa) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F9] p-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center max-w-md">
          <AlertTriangle size={48} className="text-[#F97316] mx-auto mb-4" />
          <h2 className="text-xl text-[#334155] mb-2">Error</h2>
          <p className="text-[#64748B] mb-6">{error || 'Mesa no encontrada'}</p>
          <SecondaryButton onClick={() => router.push('/dashboard-mesero')}>
            <ArrowLeft size={16} />
            Volver al Dashboard
          </SecondaryButton>
        </div>
      </div>
    );
  }

  const config =
    estadoConfig[mesa.estado.toLowerCase()] || estadoConfig.disponible;
  const isOcupada = mesa.estado.toLowerCase() === 'ocupada';
  const isDisponible = mesa.estado.toLowerCase() === 'disponible';

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard-mesero')}
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isDisponible && (
                <PrimaryButton onClick={handleGenerarQR}>
                  <QrCode size={16} />
                  Generar QR
                </PrimaryButton>
              )}
              {isOcupada && (
                <DangerButton onClick={() => setShowCancelarModal(true)}>
                  <XCircle size={16} />
                  Cancelar Mesa
                </DangerButton>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
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
              Genera un código QR para que el cliente pueda realizar pedidos
              desde su dispositivo.
            </p>
            <PrimaryButton onClick={handleGenerarQR} size="lg">
              <QrCode size={20} />
              Generar Código QR
            </PrimaryButton>
          </div>
        )}

        {/* Estado de Mesa Ocupada - Vista de Pedido */}
        {isOcupada && mesa.pedido_activo && (
          <>
            {/* Info del Pedido */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                <h2 className="text-base sm:text-lg text-[#334155] flex items-center gap-2">
                  <ShoppingBag
                    size={18}
                    className="text-[#F97316] sm:w-5 sm:h-5"
                  />
                  Pedido #{mesa.pedido_activo.id}
                </h2>
                <span className="text-xs sm:text-sm text-[#64748B] flex items-center gap-1">
                  <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                  {formatDate(mesa.pedido_activo.creado_el)}
                </span>
              </div>

              {/* Estado del Pedido */}
              <div className="mb-4">
                <span className="text-xs sm:text-sm text-[#64748B] mb-2 block">
                  Estado del Pedido:
                </span>
                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-orange-50 text-[#F97316] border-2 border-orange-200">
                  {mesa.pedido_activo.estado === 'iniciado' && (
                    <>
                      <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Iniciado
                    </>
                  )}
                  {mesa.pedido_activo.estado === 'recepcion' && (
                    <>
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      En Recepción
                    </>
                  )}
                  {mesa.pedido_activo.estado === 'en_proceso' && (
                    <>
                      <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      En Preparación
                    </>
                  )}
                  {mesa.pedido_activo.estado === 'terminado' && (
                    <>
                      <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Listo
                    </>
                  )}
                  {mesa.pedido_activo.estado === 'servido' && (
                    <>
                      <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Servido
                    </>
                  )}
                  {mesa.pedido_activo.estado === 'completado' && (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Completado
                    </>
                  )}
                  {mesa.pedido_activo.estado === 'cancelado' && (
                    <>
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Cancelado
                    </>
                  )}
                </span>
              </div>

              {/* Líneas del Pedido */}
              <div className="border-t border-[#E2E8F0] pt-4">
                <h3 className="text-xs sm:text-sm text-[#64748B] mb-3">
                  Productos del Pedido:
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {mesa.pedido_activo.lineas.map((linea) => (
                    <div
                      key={linea.id}
                      className="flex items-start sm:items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-[#F8FAFC] rounded-lg gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-[#334155]">
                          {linea.producto_nombre}
                        </p>
                        {linea.observaciones && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 sm:mt-1">
                            Nota: {linea.observaciones}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 flex-shrink-0">
                        <span className="text-[#64748B] text-xs sm:text-sm">
                          x{linea.cantidad}
                        </span>
                        <span className="text-[#334155] text-sm sm:text-base font-medium sm:w-24 text-right">
                          {formatCurrency(
                            linea.precio_unitario * linea.cantidad
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                  <span className="text-base sm:text-lg text-[#334155] flex items-center gap-2">
                    <DollarSign
                      size={18}
                      className="text-[#22C55E] sm:w-5 sm:h-5"
                    />
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl text-[#334155]">
                    {formatCurrency(mesa.pedido_activo.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm text-[#64748B] mb-3 sm:mb-4">
                Acciones de Mesa
              </h3>
              <div className="flex flex-col gap-2 sm:gap-3">
                {/* Botón Entregado - Solo visible cuando el pedido está terminado (listo) */}
                {mesa.pedido_activo.estado === 'terminado' && (
                  <PrimaryButton
                    onClick={handleMarcarServido}
                    disabled={marcarServidoLoading}
                  >
                    {marcarServidoLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span className="text-sm sm:text-base">
                          Marcando...
                        </span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">
                          Marcar como Entregado
                        </span>
                      </>
                    )}
                  </PrimaryButton>
                )}

                {/* Botón Pago - Solo visible cuando el pedido está servido */}
                {mesa.pedido_activo.estado === 'servido' && (
                  <PrimaryButton
                    onClick={() => setShowConfirmarPagoModal(true)}
                    disabled={marcarCompletadoLoading}
                  >
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">
                      Registrar Pago
                    </span>
                  </PrimaryButton>
                )}
                      </>
                    )}
                  </PrimaryButton>
                )}

                <DangerButton onClick={() => setShowCancelarModal(true)}>
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">
                    Cancelar Mesa y Pedido
                  </span>
                </DangerButton>
              </div>
            </div>
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
            <DangerButton onClick={() => setShowCancelarModal(true)}>
              <XCircle size={16} />
              Cancelar Mesa
            </DangerButton>
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
              Esta mesa tiene una reserva activa. Espera a que el cliente
              llegue.
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
      </main>

      {/* QR Modal */}
      {showQRModal && mesa && (
        <QRGenerateModal
          mesa={{
            ...mesa,
            id_empresa: mesa.id_empresa || '',
            orden: mesa.orden || 0,
            estado: mesa.estado as
              | 'DISPONIBLE'
              | 'RESERVADA'
              | 'OCUPADA'
              | 'FUERA_DE_SERVICIO',
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

      {/* Confirmar Pago Modal */}
      {showConfirmarPagoModal && mesa.pedido_activo && (
        <ConfirmarPagoModal
          isOpen={showConfirmarPagoModal}
          onClose={() => setShowConfirmarPagoModal(false)}
          onConfirm={handleMarcarCompletado}
          monto={mesa.pedido_activo.total}
          isLoading={marcarCompletadoLoading}
        />
      )}
    </div>
  );
}
