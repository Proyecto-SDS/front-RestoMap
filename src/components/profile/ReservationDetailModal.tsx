import {
    Calendar,
    Clock,
    Copy,
    ExternalLink,
    MapPin,
    Users,
    X,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ReservationData } from './ReservationCard';

interface ReservationDetailModalProps {
  reservation: ReservationData;
  onClose: () => void;
  onCancel: (id: string) => void;
  onViewEstablishment: (id: string) => void;
  onCopyConfirmation: () => void;
}

export function ReservationDetailModal({
  reservation,
  onClose,
  onCancel,
  onViewEstablishment,
  onCopyConfirmation,
}: ReservationDetailModalProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-[#22C55E] text-white shadow-sm',
      pending: 'bg-[#F59E0B] text-white shadow-sm',
      cancelled: 'bg-[#94A3B8] text-white shadow-sm',
    };

    const labels = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
    };

    return (
      <span
        className={`text-sm px-3 py-1 rounded-full ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const isPastDate = () => {
    const reservationDate = new Date(
      `${reservation.fecha_reserva}T${reservation.hora_reserva}`
    );
    return reservationDate < new Date();
  };

  const canCancel = reservation.estado === 'confirmed' && !isPastDate();

  // Generate QR code URL (using a QR code API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `RESERVA-${reservation.codigo_confirmacion}`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image */}
        <div className="relative h-64 w-full shrink-0">
          <ImageWithFallback
            src={reservation.establishment.image}
            alt={reservation.establishment.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Header Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#334155] mb-2">
              {reservation.establishment.name}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-1 rounded bg-linear-to-r from-[#F97316] to-[#FB923C] text-white">
                {reservation.establishment.type}
              </span>
              {getStatusBadge(reservation.estado)}
            </div>
            <div className="flex items-start gap-2 text-sm text-[#64748B]">
              <MapPin size={16} className="shrink-0 mt-0.5 text-[#F97316]" />
              <span>{reservation.establishment.address}</span>
            </div>
          </div>

          {/* Reservation Details Card */}
          <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-xl p-6 mb-6">
            <h3 className="text-[#334155] mb-4">Detalles de la reserva</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-[#F97316]" />
                <div>
                  <p className="text-sm text-[#94A3B8]">Fecha</p>
                  <p className="text-[#334155]">
                    {formatDate(reservation.fecha_reserva, 'long')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={20} className="text-[#F97316]" />
                <div>
                  <p className="text-sm text-[#94A3B8]">Hora</p>
                  <p className="text-[#334155]">{reservation.hora_reserva}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-[#F97316]" />
                <div>
                  <p className="text-sm text-[#94A3B8]">Mesa</p>
                  <p className="text-[#334155]">
                    {reservation.mesa.nombre} - Capacidad{' '}
                    {reservation.mesa.capacidad} personas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users size={20} className="text-[#F97316]" />
                <div>
                  <p className="text-sm text-[#94A3B8]">Número de personas</p>
                  <p className="text-[#334155]">
                    {reservation.numero_personas}{' '}
                    {reservation.numero_personas === 1 ? 'persona' : 'personas'}
                  </p>
                </div>
              </div>

              {reservation.notas && (
                <div className="pt-3 border-t border-orange-200">
                  <p className="text-sm text-[#94A3B8] mb-1">
                    Notas especiales
                  </p>
                  <p className="text-sm text-[#64748B] italic">
                    "{reservation.notas}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Code */}
          <div className="bg-[#F1F5F9] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">
                  Código de confirmación
                </p>
                <p className="text-[#334155] font-mono">
                  {reservation.codigo_confirmacion}
                </p>
              </div>
              <button
                onClick={onCopyConfirmation}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                aria-label="Copiar código"
              >
                <Copy size={20} className="text-[#64748B]" />
              </button>
            </div>
          </div>

          {/* QR Code */}
          {(reservation.estado === 'confirmed' ||
            reservation.estado === 'pending') && (
            <div className="bg-white border-2 border-[#E2E8F0] rounded-xl p-6 mb-6 text-center">
              <h3 className="text-[#334155] mb-3">Código QR</h3>
              <div className="flex justify-center mb-3">
                {reservation.qrImage ? (
                  <ImageWithFallback
                    src={reservation.qrImage}
                    alt="QR Code"
                    className="w-48 h-48 border border-[#E2E8F0] rounded-lg"
                  />
                ) : (
                  <ImageWithFallback
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 border border-[#E2E8F0] rounded-lg"
                  />
                )}
              </div>
              <p className="text-sm text-[#64748B]">
                Mostrar este código al llegar al establecimiento
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <PrimaryButton
              onClick={() => onViewEstablishment(reservation.establishment.id)}
              className="w-full"
            >
              <ExternalLink size={18} />
              Ir al local
            </PrimaryButton>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {canCancel && (
                <button
                  onClick={() => onCancel(reservation.id)}
                  className="px-6 py-3 rounded-lg border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors"
                >
                  Cancelar reserva
                </button>
              )}
              <SecondaryButton
                onClick={onClose}
                className={canCancel ? '' : 'md:col-span-2'}
              >
                Cerrar
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
