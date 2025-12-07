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
  // Estados separados para mes y año
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );
  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(
    currentDate.getMonth() + 1
  );

  // Nombres de los meses
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Generar años (desde 2020 hasta año actual + 1)
  const years = Array.from(
    { length: currentDate.getFullYear() - 2020 + 2 },
    (_, i) => 2020 + i
  );

  // Calcular fecha inicio y fin del mes
  const getMonthRange = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return {
      inicio: firstDay.toISOString().split('T')[0],
      fin: lastDay.toISOString().split('T')[0],
    };
  };

  const loadReservas = useCallback(async () => {
    try {
      setLoading(true);
      const { inicio, fin } = getMonthRange(selectedYear, selectedMonthNum);
      const data = await api.empresa.getReservas({
        fecha_inicio: inicio,
        fecha_fin: fin,
        estado: filterEstado || undefined,
      });
      setReservas(data || []);
    } catch (error) {
      console.error('Error loading reservas:', error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [filterEstado, selectedYear, selectedMonthNum]);

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
              {reservas.length} reservas para el mes seleccionado
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#F97316]" />
              <select
                value={selectedMonthNum}
                onChange={(e) => setSelectedMonthNum(Number(e.target.value))}
                className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
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
          <h3 className="text-[#334155] mb-2">No hay reservas este mes</h3>
          <p className="text-sm text-[#64748B]">
            Las reservas del mes seleccionado apareceran aqui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...reservas]
            .sort((a, b) => {
              const now = new Date();
              const dateA = new Date(`${a.fecha}T${a.hora}`);
              const dateB = new Date(`${b.fecha}T${b.hora}`);
              const diffA = Math.abs(dateA.getTime() - now.getTime());
              const diffB = Math.abs(dateB.getTime() - now.getTime());
              return diffA - diffB;
            })
            .map((reserva) => {
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
                          <Calendar size={14} />
                          {new Date(
                            reserva.fecha + 'T00:00:00'
                          ).toLocaleDateString('es-CL', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
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
