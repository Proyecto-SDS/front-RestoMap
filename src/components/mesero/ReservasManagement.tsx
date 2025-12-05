'use client';

import { Calendar, Clock, Phone, Users, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { api } from '../../utils/apiClient';
import { DangerButton } from '../buttons/DangerButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface Reserva {
  id: number;
  usuario_nombre: string;
  usuario_telefono?: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'rechazada' | 'expirada';
  mesas: string[];
  codigo_qr: string;
  creado_el: string;
}

interface ReservasManagementProps {
  mesas?: Mesa[];
  readOnly?: boolean;
}

export function ReservasManagement({
  readOnly = false,
}: ReservasManagementProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelar, setShowCancelar] = useState<Reserva | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const loadReservas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.empresa.getReservas(
        selectedDate,
        filterEstado || undefined
      );
      setReservas(data || []);
    } catch (error) {
      console.error('Error loading reservas:', error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [filterEstado, selectedDate]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas]);

  const handleCancelar = async () => {
    if (!showCancelar) return;

    try {
      setCancelling(true);
      await api.empresa.cancelarReserva(showCancelar.id);
      await loadReservas();
      setShowCancelar(null);
    } catch (error) {
      console.error('Error cancelling reserva:', error);
    } finally {
      setCancelling(false);
    }
  };

  const getEstadoColor = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'pendiente':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          label: 'Pendiente',
        };
      case 'confirmada':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          label: 'Confirmada',
        };
      case 'rechazada':
        return { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelada' };
      case 'expirada':
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          label: 'Expirada',
        };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', label: estado };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl text-[#334155] mb-1">Reservas</h2>
            <p className="text-sm text-[#94A3B8]">
              {reservas.length} reservas para la fecha seleccionada
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#F97316]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
            </div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155]"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="rechazada">Cancelada</option>
              <option value="expirada">Expirada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservas List */}
      {reservas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <Calendar size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <h3 className="text-[#334155] mb-2">No hay reservas para hoy</h3>
          <p className="text-sm text-[#64748B]">
            Las reservas del dia apareceran aqui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map((reserva) => {
            const estadoStyle = getEstadoColor(reserva.estado);

            return (
              <div
                key={reserva.id}
                className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-[#334155]">
                        {reserva.usuario_nombre}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${estadoStyle.bg} ${estadoStyle.text}`}
                      >
                        {estadoStyle.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {reserva.hora}
                      </span>
                      {reserva.usuario_telefono && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {reserva.usuario_telefono}
                        </span>
                      )}
                      {reserva.mesas.length > 0 && (
                        <span className="flex items-center gap-1 text-[#22C55E]">
                          <Users size={14} />
                          {reserva.mesas.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Codigo QR */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-[#94A3B8]">Codigo:</span>
                      <code className="px-2 py-1 bg-[#F1F5F9] rounded text-xs text-[#334155] font-mono">
                        {reserva.codigo_qr}
                      </code>
                    </div>
                  </div>

                  {/* Acciones */}
                  {!readOnly &&
                    reserva.estado !== 'rechazada' &&
                    reserva.estado !== 'expirada' && (
                      <DangerButton
                        onClick={() => setShowCancelar(reserva)}
                        size="sm"
                      >
                        <XCircle size={16} />
                        Cancelar
                      </DangerButton>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cancelar Reserva */}
      {showCancelar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#334155]">Cancelar Reserva</h3>
              <button
                onClick={() => setShowCancelar(null)}
                className="p-1 hover:bg-[#F1F5F9] rounded"
              >
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                Esta a punto de cancelar la reserva de{' '}
                <strong>{showCancelar.usuario_nombre}</strong> para las{' '}
                <strong>{showCancelar.hora}</strong>.
              </p>
              <p className="text-xs text-red-600 mt-2">
                Esta accion no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3">
              <SecondaryButton
                onClick={() => setShowCancelar(null)}
                className="flex-1"
                disabled={cancelling}
              >
                Volver
              </SecondaryButton>
              <DangerButton
                onClick={handleCancelar}
                className="flex-1"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelacion'}
              </DangerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
