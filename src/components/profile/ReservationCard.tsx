import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface ReservationData {
  id: string;
  establishment: {
    id: string;
    name: string;
    type: 'Restaurante' | 'Restobar' | 'Bar';
    image: string;
    address: string;
  };
  fecha_reserva: string;
  hora_reserva: string;
  mesa: {
    nombre: string;
    capacidad: number;
  };
  numero_personas: number;
  estado: 'confirmed' | 'pending' | 'cancelled';
  notas?: string;
  codigo_confirmacion: string;
}

interface ReservationCardProps {
  reservation: ReservationData;
  onViewDetails: (reservation: ReservationData) => void;
  onCancel?: (id: string) => void;
}

export function ReservationCard({
  reservation,
  onViewDetails,
  onCancel,
}: ReservationCardProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-[#22C55E]/10 text-[#22C55E]',
      pending: 'bg-[#F59E0B]/10 text-[#F59E0B]',
      cancelled: 'bg-[#94A3B8]/10 text-[#94A3B8]',
    };

    const labels = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
    };

    return (
      <span
        className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      Restaurante: 'bg-gradient-to-r from-[#F97316] to-[#FB923C]',
      Restobar: 'bg-gradient-to-r from-[#EF4444] to-[#F97316]',
      Bar: 'bg-gradient-to-r from-[#DC2626] to-[#EF4444]',
    };
    return colors[type as keyof typeof colors] || colors.Restaurante;
  };

  const isPastDate = () => {
    const reservationDate = new Date(
      `${reservation.fecha_reserva}T${reservation.hora_reserva}`
    );
    return reservationDate < new Date();
  };

  const canCancel = reservation.estado === 'confirmed' && !isPastDate();

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={reservation.establishment.image}
          alt={reservation.establishment.name}
          className="w-full h-full object-cover"
        />
        {getStatusBadge(reservation.estado)}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-[#334155] mb-1">
              {reservation.establishment.name}
            </h4>
            <span
              className={`text-xs px-2 py-1 rounded text-white ${getTypeBadgeColor(
                reservation.establishment.type
              )}`}
            >
              {reservation.establishment.type}
            </span>
          </div>
        </div>

        {/* Reservation details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Calendar size={16} />
            <span>{formatDate(reservation.fecha_reserva, 'long')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Clock size={16} />
            <span>{reservation.hora_reserva}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <MapPin size={16} />
            <span>
              {reservation.mesa.nombre} - {reservation.mesa.capacidad} personas
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Users size={16} />
            <span>
              {reservation.numero_personas}{' '}
              {reservation.numero_personas === 1 ? 'persona' : 'personas'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F1F5F9] rounded-lg p-3 mb-3">
          <p className="text-xs text-[#64748B]">
            Reserva #{reservation.codigo_confirmacion}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <SecondaryButton
            size="sm"
            onClick={() => onViewDetails(reservation)}
            className="flex-1"
          >
            Ver detalles
          </SecondaryButton>
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(reservation.id)}
              className="px-4 py-2 text-sm rounded-lg border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
