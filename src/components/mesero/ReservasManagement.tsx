'use client';

import { Calendar, Clock, MapPin, Phone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

interface Reserva {
  id: string;
  usuario_nombre: string;
  usuario_telefono?: string;
  fecha: string;
  hora: string;
  num_personas: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  mesa_asignada?: string;
  notas?: string;
}

interface ReservasManagementProps {
  mesas: Mesa[];
  onMesaUpdate?: (mesa: Mesa) => void;
  readOnly?: boolean;
}

export function ReservasManagement({
  mesas,
  onMesaUpdate,
  readOnly = false,
}: ReservasManagementProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showAsignarMesa, setShowAsignarMesa] = useState(false);
  const [selectedMesaId, setSelectedMesaId] = useState<string>('');

  // Cargar reservas del dia
  useEffect(() => {
    const loadReservas = async () => {
      try {
        setLoading(true);
        // Mock data - en produccion llamar a api.empresa.getReservas()
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockReservas: Reserva[] = [
          {
            id: '1',
            usuario_nombre: 'Juan Perez',
            usuario_telefono: '+56912345678',
            fecha: new Date().toISOString().split('T')[0],
            hora: '19:00',
            num_personas: 4,
            estado: 'confirmada',
            notas: 'Celebracion de cumpleanos',
          },
          {
            id: '2',
            usuario_nombre: 'Maria Gonzalez',
            usuario_telefono: '+56987654321',
            fecha: new Date().toISOString().split('T')[0],
            hora: '20:30',
            num_personas: 2,
            estado: 'pendiente',
          },
          {
            id: '3',
            usuario_nombre: 'Carlos Lopez',
            fecha: new Date().toISOString().split('T')[0],
            hora: '21:00',
            num_personas: 6,
            estado: 'confirmada',
            mesa_asignada: 'Mesa 3',
          },
        ];
        setReservas(mockReservas);
      } catch (error) {
        console.error('Error loading reservas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReservas();
  }, []);

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
      case 'cancelada':
        return { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelada' };
      case 'completada':
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          label: 'Completada',
        };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', label: estado };
    }
  };

  const mesasDisponibles = mesas.filter(
    (m) =>
      m.estado === 'DISPONIBLE' &&
      m.capacidad >= (selectedReserva?.num_personas || 0)
  );

  const handleAsignarMesa = async () => {
    if (!selectedReserva || !selectedMesaId) return;

    // Mock - actualizar reserva
    setReservas((prev) =>
      prev.map((r) =>
        r.id === selectedReserva.id
          ? {
              ...r,
              mesa_asignada: mesas.find((m) => m.id === selectedMesaId)?.nombre,
            }
          : r
      )
    );

    // Actualizar mesa a ocupada
    const mesa = mesas.find((m) => m.id === selectedMesaId);
    if (mesa && onMesaUpdate) {
      onMesaUpdate({ ...mesa, estado: 'OCUPADA' });
    }

    setShowAsignarMesa(false);
    setSelectedReserva(null);
    setSelectedMesaId('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  const reservasHoy = reservas.filter(
    (r) => r.fecha === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl text-[#334155] mb-1">Reservas de Hoy</h2>
            <p className="text-sm text-[#94A3B8]">
              {reservasHoy.length} reservas para hoy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-[#F97316]" />
            <span className="text-[#334155]">
              {new Date().toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Reservas List */}
      {reservasHoy.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <Calendar size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <h3 className="text-[#334155] mb-2">No hay reservas para hoy</h3>
          <p className="text-sm text-[#64748B]">
            Las reservas del dia apareceran aqui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservasHoy.map((reserva) => {
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
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {reserva.num_personas} personas
                      </span>
                      {reserva.usuario_telefono && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {reserva.usuario_telefono}
                        </span>
                      )}
                      {reserva.mesa_asignada && (
                        <span className="flex items-center gap-1 text-[#22C55E]">
                          <MapPin size={14} />
                          {reserva.mesa_asignada}
                        </span>
                      )}
                    </div>

                    {reserva.notas && (
                      <p className="text-xs text-[#94A3B8] mt-2 italic">
                        Nota: {reserva.notas}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  {!readOnly &&
                    reserva.estado === 'confirmada' &&
                    !reserva.mesa_asignada && (
                      <PrimaryButton
                        onClick={() => {
                          setSelectedReserva(reserva);
                          setShowAsignarMesa(true);
                        }}
                        size="sm"
                      >
                        <MapPin size={16} />
                        Asignar Mesa
                      </PrimaryButton>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Asignar Mesa */}
      {showAsignarMesa && selectedReserva && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg text-[#334155] mb-2">Asignar Mesa</h3>
            <p className="text-sm text-[#64748B] mb-4">
              Selecciona una mesa para {selectedReserva.usuario_nombre} (
              {selectedReserva.num_personas} personas)
            </p>

            {mesasDisponibles.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {mesasDisponibles.map((mesa) => (
                    <label
                      key={mesa.id}
                      className={`
                        flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          selectedMesaId === mesa.id
                            ? 'border-[#F97316] bg-[#FFF7ED]'
                            : 'border-[#E2E8F0] hover:border-[#F97316]/30'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="mesa"
                        value={mesa.id}
                        checked={selectedMesaId === mesa.id}
                        onChange={(e) => setSelectedMesaId(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-sm text-[#334155]">
                        {mesa.nombre}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        {mesa.capacidad} personas
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <SecondaryButton
                    onClick={() => {
                      setShowAsignarMesa(false);
                      setSelectedReserva(null);
                      setSelectedMesaId('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleAsignarMesa}
                    disabled={!selectedMesaId}
                    className="flex-1"
                  >
                    Asignar
                  </PrimaryButton>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-[#64748B] mb-4">
                  No hay mesas disponibles con capacidad para{' '}
                  {selectedReserva.num_personas} personas
                </p>
                <SecondaryButton
                  onClick={() => {
                    setShowAsignarMesa(false);
                    setSelectedReserva(null);
                  }}
                >
                  Cerrar
                </SecondaryButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
