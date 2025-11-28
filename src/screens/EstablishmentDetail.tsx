'use client';

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Heart,
  Instagram,
  MapPin,
  Phone,
  Star,
  Twitter,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RatingBadge } from '../components/badges/RatingBadge';
import { StatusBadge } from '../components/badges/StatusBadge';
import { TypeBadge } from '../components/badges/TypeBadge';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { SecondaryButton } from '../components/buttons/SecondaryButton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { TabNavigation } from '../components/navigation/TabNavigation';
import { useAuth } from '../context/AuthContext';
import type {
  DetailedEstablishment,
  MesaInfo,
  Review,
  TabItem,
  UserOpinion,
} from '../types';
import { api } from '../utils/apiClient';
import { formatPhoneNumber, getRelativeTime } from '../utils/formatters';

// Función para generar slots de tiempo cada 15 minutos
const generateTimeSlots = (startTime: string, endTime: string): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  const endTotalMinutes = endHour * 60 + endMin;

  while (currentHour * 60 + currentMin < endTotalMinutes) {
    const hourStr = currentHour.toString().padStart(2, '0');
    const minStr = currentMin.toString().padStart(2, '0');
    slots.push(`${hourStr}:${minStr}`);

    currentMin += 15;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour += 1;
    }
  }

  return slots;
};

// Función para restar 1 hora de un horario
const subtractOneHour = (time: string): string => {
  const [hour, min] = time.split(':').map(Number);
  let newHour = hour - 1;
  if (newHour < 0) newHour = 23;
  return `${newHour.toString().padStart(2, '0')}:${min
    .toString()
    .padStart(2, '0')}`;
};

// Header Component
function EstablishmentHeader({
  establishment,
  onBack,
  isFavorite,
  onToggleFavorite,
}: any) {
  // Priorizar banner, luego hero, luego la primera imagen disponible
  const bannerImage =
    establishment.images?.banner?.[0] ||
    establishment.images?.hero?.[0] ||
    establishment.images?.todas?.[0] ||
    establishment.image || // Fallback para compatibilidad
    '/placeholder-restaurant.jpg';

  return (
    <div className="relative h-[300px] overflow-hidden">
      <ImageWithFallback
        src={bannerImage}
        alt={establishment.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        aria-label="Volver"
      >
        <ArrowLeft size={24} className="text-[#334155]" />
      </button>

      {/* Favorite button */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart
          size={24}
          className={
            isFavorite ? 'text-[#EF4444] fill-[#EF4444]' : 'text-[#334155]'
          }
        />
      </button>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="mb-2">
          <TypeBadge type={establishment.type} />
        </div>
        <h1 className="text-white mb-2">{establishment.name}</h1>
        <RatingBadge
          rating={establishment.rating}
          reviewCount={establishment.reviewCount}
        />
      </div>
    </div>
  );
}

// Quick Info Bar Component
function QuickInfoBar({ establishment, onReserveClick, isLoggedIn }: any) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <RatingBadge
              rating={establishment.rating}
              reviewCount={establishment.reviewCount}
            />
            <StatusBadge
              status={establishment.status}
              closingTime={establishment.closingTime}
            />
            <div className="flex items-center gap-1 text-sm text-[#64748B]">
              <MapPin size={16} className="text-[#F97316]" />
              <span>
                {establishment.address}, {establishment.commune}
              </span>
            </div>
          </div>
          {isLoggedIn && (
            <PrimaryButton size="md" onClick={onReserveClick}>
              Reservar mesa
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

// Tab 1: Información
function InformacionTab({ establishment, hours, photos }: any) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Description */}
      {establishment.description && (
        <section>
          <h2 className="text-[#334155] mb-3">Acerca de</h2>
          <p className="text-[#64748B]">{establishment.description}</p>
        </section>
      )}

      {/* Contact Info */}
      <section>
        <h2 className="text-[#334155] mb-3">Información de contacto</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-[#F97316]" />
            <span className="text-[#64748B]">
              {establishment.address}, {establishment.commune}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-[#F97316]" />
            <a
              href={`tel:${establishment.phone}`}
              className="text-[#3B82F6] hover:underline"
            >
              {formatPhoneNumber(establishment.phone)}
            </a>
            <a
              href={`https://wa.me/${establishment.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22C55E] hover:underline text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Redes Sociales */}
      {establishment.redesSociales &&
        establishment.redesSociales.length > 0 && (
          <section>
            <h2 className="text-[#334155] mb-3">Redes Sociales</h2>
            <div className="flex flex-wrap gap-3">
              {establishment.redesSociales.map((red: any, index: number) => {
                const getIcon = () => {
                  const tipo = red.tipo.toLowerCase();
                  if (tipo.includes('instagram'))
                    return <Instagram size={18} />;
                  if (tipo.includes('facebook')) return <Facebook size={18} />;
                  if (tipo.includes('twitter') || tipo.includes('x'))
                    return <Twitter size={18} />;
                  return null;
                };

                const icon = getIcon();

                // Limpiar @ duplicadas del usuario
                const usuario = red.usuario.startsWith('@')
                  ? red.usuario.slice(1)
                  : red.usuario;

                return (
                  <a
                    key={index}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg transition-colors text-[#334155] text-sm"
                    title={`${red.tipo}: @${usuario}`}
                  >
                    {icon && <span className="text-[#F97316]">{icon}</span>}
                    <span>@{usuario}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

      {/* Hours */}
      <section>
        <h2 className="text-[#334155] mb-3">Horarios</h2>
        <div className="space-y-2">
          {hours.map((hour: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b border-[#E2E8F0] last:border-0"
            >
              <span className="text-[#334155]">{hour.dia}</span>
              <span
                className={hour.abierto ? 'text-[#64748B]' : 'text-[#EF4444]'}
              >
                {hour.abierto ? `${hour.apertura} - ${hour.cierre}` : 'Cerrado'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section>
        <h2 className="text-[#334155] mb-3">Fotos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedPhoto(photo)}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            >
              <ImageWithFallback
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Full-screen photo viewer */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            aria-label="Cerrar"
          >
            ×
          </button>
          <ImageWithFallback
            src={selectedPhoto}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

// Tab 2: Menú
function MenuTab({ categories, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-[#334155]">Menú</h2>
        <p className="text-[#64748B]">Cargando menú...</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-[#334155]">Menú</h2>
        <p className="text-[#64748B]">No hay menú disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-[#334155]">Menú</h2>

      {categories.map((category: any) => (
        <section key={category.id}>
          <h3 className="text-[#334155] mb-4">{category.nombre}</h3>
          <div className="space-y-4">
            {category.productos.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex gap-4"
              >
                {item.imagen && (
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[#334155]">{item.nombre}</h4>
                    <span className="text-[#F97316]">
                      ${item.precio.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B] mb-2">
                    {item.descripcion}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.estado === 'disponible'
                        ? 'bg-[#22C55E]/10 text-[#22C55E]'
                        : 'bg-[#94A3B8]/10 text-[#94A3B8]'
                    }`}
                  >
                    {item.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Tab 3: Opiniones
function OpinionesTab({
  opinions,
  currentUserOpinion,
  isLoggedIn,
  onSubmitOpinion,
  onLoginClick,
}: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const opinionsPerPage = 5;

  const avgRating =
    opinions.length > 0
      ? opinions.reduce((sum: number, op: any) => sum + op.puntuacion, 0) /
        opinions.length
      : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (stars) => opinions.filter((op: any) => op.puntuacion === stars).length
  );

  const handleSubmit = () => {
    if (comment.length >= 20 && rating > 0) {
      onSubmitOpinion({ rating, comment });
      setRating(0);
      setComment('');
    }
  };

  const totalPages = Math.ceil(
    (opinions.length - (currentUserOpinion ? 1 : 0)) / opinionsPerPage
  );
  const startIndex = (currentPage - 1) * opinionsPerPage;
  const displayedOpinions = opinions
    .filter((op: any) => op.id !== currentUserOpinion?.id)
    .slice(startIndex, startIndex + opinionsPerPage);

  return (
    <div className="space-y-8">
      <h2 className="text-[#334155]">Opiniones</h2>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="text-center md:text-left">
            <div className="text-4xl mb-2">{avgRating.toFixed(1)}</div>
            <RatingBadge rating={avgRating} reviewCount={opinions.length} />
          </div>
          <div className="flex-1 space-y-2">
            {ratingDistribution.map((count, index) => {
              const stars = 5 - index;
              const percentage =
                opinions.length > 0 ? (count / opinions.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm text-[#64748B] w-12">{stars} </span>
                  <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#22C55E]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-[#64748B] w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User's Opinion Input or Existing Opinion */}
      {!isLoggedIn ? (
        <div className="bg-[#F1F5F9] rounded-xl p-6 text-center">
          <p className="text-[#64748B] mb-4">
            Inicia sesión para escribir una opinión
          </p>
          <PrimaryButton onClick={onLoginClick}>Iniciar sesión</PrimaryButton>
        </div>
      ) : currentUserOpinion ? (
        <div className="bg-white rounded-xl border-4 border-[#F97316] p-6">
          <p className="text-sm text-[#64748B] mb-2">Tu opinión</p>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white">
              {currentUserOpinion.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h4 className="text-[#334155] mb-1">
                {currentUserOpinion.userName}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= currentUserOpinion.rating
                          ? 'fill-[#F97316] text-[#F97316]'
                          : 'fill-[#FED7AA] text-[#FED7AA]'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-[#64748B]">
                  {getRelativeTime(currentUserOpinion.date)}
                </span>
              </div>
              <p className="text-[#64748B]">{currentUserOpinion.comment}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <h3 className="text-[#334155] mb-4">¿Cuál fue tu experiencia?</h3>

          {/* Star Rating */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    star <= (hoverRating || rating)
                      ? 'fill-[#F97316] text-[#F97316]'
                      : 'fill-[#FED7AA] text-[#FED7AA]'
                  }
                />
              </button>
            ))}
          </div>

          {/* Comment Input */}
          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Mínimo 20 caracteres, máximo 500"
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl resize-none focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
              rows={4}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-[#64748B]">
                {comment.length}/500
              </span>
              {comment.length < 20 && comment.length > 0 && (
                <span className="text-sm text-[#EF4444]">
                  Mínimo 20 caracteres
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <PrimaryButton
              onClick={handleSubmit}
              disabled={comment.length < 20 || rating === 0}
              className="flex-1"
            >
              Publicar opinión
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setRating(0);
                setComment('');
              }}
            >
              Cancelar
            </SecondaryButton>
          </div>
        </div>
      )}

      {/* Other Opinions */}
      <div className="space-y-4">
        {displayedOpinions.length === 0 && !currentUserOpinion ? (
          <div className="text-center py-8 text-[#64748B]">
            Sé el primero en dejar tu opinión
          </div>
        ) : (
          displayedOpinions.map((opinion: Review) => (
            <div
              key={opinion.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#334155]">
                  {opinion.usuario.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="text-[#334155] mb-1">{opinion.usuario}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= opinion.puntuacion
                              ? 'fill-[#F97316] text-[#F97316]'
                              : 'fill-[#FED7AA] text-[#FED7AA]'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[#64748B]">
                      {getRelativeTime(opinion.fecha)}
                    </span>
                  </div>
                  <p className="text-[#64748B]">{opinion.comentario}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-[#64748B]">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab 4: Reservas
function ReservasTab({
  tables,
  isLoggedIn,
  onLoginClick,
  establishmentId,
  establishment,
  tablesLoading,
}: any) {
  const router = useRouter();
  const [reservationStep, setReservationStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedMesa, setSelectedMesa] = useState<any>(null);
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingMesas, setIsCheckingMesas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservaCreada, setReservaCreada] = useState<any>(null);
  const [availableMesas, setAvailableMesas] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Función para obtener horarios disponibles según la fecha seleccionada
  const getTimeSlotsForDate = async (dateStr: string): Promise<string[]> => {
    if (!establishmentId || !dateStr) return [];

    try {
      const response = await api.getAvailableTimeSlots(
        establishmentId,
        dateStr
      );
      return response.horarios || [];
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      return [];
    }
  };

  // Actualizar slots cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        const slots = await getTimeSlotsForDate(selectedDate);
        setAvailableTimeSlots(slots);
        // Resetear hora seleccionada si no está disponible
        if (selectedTime && !slots.includes(selectedTime)) {
          setSelectedTime('');
        }
      };
      fetchSlots();
    }
  }, [selectedDate, establishmentId]);

  // Función para verificar disponibilidad de mesas
  const checkMesaAvailability = async (date: string, time: string) => {
    if (!establishmentId) return [];

    try {
      const response = await api.getAvailableTables(
        establishmentId,
        date,
        time
      );
      return response.mesas || [];
    } catch (error) {
      console.error('Error al verificar disponibilidad de mesas:', error);
      return tables;
    }
  };

  // Check availability when date and time are selected
  useEffect(() => {
    if (selectedDate && selectedTime && !tablesLoading) {
      const fetchAvailability = async () => {
        setIsCheckingMesas(true);
        try {
          const available = await checkMesaAvailability(
            selectedDate,
            selectedTime
          );
          setAvailableMesas(available);
        } catch (error) {
          console.error('Error al verificar disponibilidad:', error);
          setAvailableMesas(tables);
        } finally {
          setIsCheckingMesas(false);
        }
      };
      fetchAvailability();
    }
  }, [selectedDate, selectedTime, tablesLoading, establishmentId]);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleNext = () => {
    setError(null);
    setReservationStep(reservationStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setReservationStep(reservationStep - 1);
  };

  const handleCancel = () => {
    setReservationStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedMesa(null);
    setPartySize(2);
    setNotes('');
    setError(null);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Llamar al endpoint de crear reserva
      const response = await api.createReservation(
        establishmentId,
        selectedMesa.id,
        selectedDate,
        selectedTime,
        partySize
      );

      if (response.success) {
        // Guardar los datos de la reserva creada
        console.log('Reserva creada:', response.reserva);
        console.log('¿Tiene QR?', !!response.reserva?.qrImage);
        console.log('Código QR:', response.reserva?.codigoQR);
        setReservaCreada(response.reserva);
        // Success - go to step 6
        setReservationStep(6);
      } else {
        setError(response.error || 'Error al confirmar la reserva');
      }
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      // Mostrar mensaje de error específico del backend
      let errorMessage =
        'Error al confirmar la reserva. Por favor, intenta de nuevo.';

      if (err.message) {
        if (err.message.includes('Mesa no disponible')) {
          errorMessage =
            'La mesa seleccionada no está disponible para este horario. Por favor, elige otra mesa u horario.';
        } else if (err.message.includes('capacidad')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-[#F1F5F9] rounded-xl p-6 text-center">
        <p className="text-[#64748B] mb-4">
          Inicia sesión para hacer una reserva
        </p>
        <PrimaryButton onClick={onLoginClick}>Iniciar sesión</PrimaryButton>
      </div>
    );
  }

  // STEP 1: SELECT DATE & TIME
  if (reservationStep === 1) {
    const isStep1Valid = selectedDate && selectedTime;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">¿Cuándo quieres reservar?</h2>
            <span className="text-sm text-[#64748B]">Paso 1 de 6</span>
          </div>
          <p className="text-[#64748B]">Selecciona fecha y hora</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker - Temporal input básico */}
            <div>
              <label className="block text-sm text-[#334155] mb-2">Fecha</label>
              <div
                className="relative cursor-pointer"
                onClick={(e) => {
                  // Evitar que se propague si ya estamos en el input
                  if (e.target === dateInputRef.current) return;

                  // Simular un click en el input para abrir el picker
                  const input = dateInputRef.current;
                  if (input) {
                    try {
                      input.focus();
                      // Intentar usar showPicker si está disponible
                      if (
                        'showPicker' in input &&
                        typeof input.showPicker === 'function'
                      ) {
                        input.showPicker();
                      }
                    } catch (error) {
                      // Si showPicker falla, el input ya está enfocado
                      console.log('showPicker not supported or failed');
                    }
                  }
                }}
              >
                <CalendarIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F97316] pointer-events-none z-10"
                  size={20}
                />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  max={getMaxDate()}
                  onClick={(e) => {
                    try {
                      if (
                        'showPicker' in e.currentTarget &&
                        typeof e.currentTarget.showPicker === 'function'
                      ) {
                        e.currentTarget.showPicker();
                      }
                    } catch (error) {
                      // Ignorar si falla
                    }
                  }}
                  style={{
                    colorScheme: 'light',
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 cursor-pointer"
                />
              </div>
              {selectedDate && (
                <p className="text-xs text-[#64748B] mt-1">
                  {formatDateDisplay(selectedDate)}
                </p>
              )}
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-sm text-[#334155] mb-2">Hora</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate || availableTimeSlots.length === 0}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 disabled:bg-[#F1F5F9] disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedDate
                    ? 'Primero selecciona una fecha'
                    : availableTimeSlots.length === 0
                    ? 'No hay horarios disponibles'
                    : 'Selecciona una hora'}
                </option>
                {availableTimeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {selectedDate && availableTimeSlots.length === 0 && (
                <p className="text-xs text-[#EF4444] mt-1">
                  No hay horarios disponibles para esta fecha.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton
            onClick={handleNext}
            disabled={!isStep1Valid}
            className="px-8"
          >
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 2: SELECT AVAILABLE MESAS
  if (reservationStep === 2) {
    const isStep2Valid = selectedMesa !== null;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">¿Qué mesa prefieres?</h2>
            <span className="text-sm text-[#64748B]">Paso 2 de 6</span>
          </div>
          <p className="text-[#64748B]">
            {formatDateDisplay(selectedDate)} a las {selectedTime}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          {isCheckingMesas ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316] mb-3"></div>
              <p className="text-[#64748B]">
                Verificando disponibilidad de mesas...
              </p>
            </div>
          ) : availableMesas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">
                No hay mesas disponibles para este horario.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMesas.map((mesa) => {
                const isAvailable = mesa.estado === 'disponible';
                const isSelected = selectedMesa?.id === mesa.id;

                return (
                  <button
                    key={mesa.id}
                    onClick={() => isAvailable && setSelectedMesa(mesa)}
                    disabled={!isAvailable}
                    className={`
                    p-4 rounded-xl border-3 text-left transition-all
                    ${
                      !isAvailable
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:shadow-md'
                    }
                    ${
                      isSelected
                        ? 'border-[#F97316] bg-[#F97316]/5'
                        : 'border-[#E2E8F0]'
                    }
                  `}
                    style={{ borderWidth: isSelected ? '3px' : '1px' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[#334155]">{mesa.nombre}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isAvailable
                            ? 'bg-[#22C55E]/10 text-[#22C55E]'
                            : 'bg-[#94A3B8]/10 text-[#94A3B8]'
                        }`}
                      >
                        {isAvailable ? 'Disponible' : 'Reservada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#64748B]">
                      <Users size={16} />
                      <span>Capacidad: {mesa.capacidad} personas</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="text-[#64748B] hover:text-[#334155] transition-colors flex items-center gap-1"
          >
            ← Volver
          </button>
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton
            onClick={handleNext}
            disabled={!isStep2Valid}
            className="px-8"
          >
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 3: SELECT PARTY SIZE
  if (reservationStep === 3) {
    const isStep3Valid = partySize >= 1 && partySize <= selectedMesa.capacidad;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">¿Cuántas personas?</h2>
            <span className="text-sm text-[#64748B]">Paso 3 de 6</span>
          </div>
          <p className="text-[#64748B]">
            Capacidad de {selectedMesa.nombre}: {selectedMesa.capacidad}{' '}
            personas
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setPartySize(Math.max(1, partySize - 1))}
              className="w-12 h-12 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors flex items-center justify-center text-2xl"
              disabled={partySize <= 1}
            >
              −
            </button>
            <div className="text-center">
              <div className="text-4xl mb-1">{partySize}</div>
              <div className="text-sm text-[#64748B]">personas</div>
            </div>
            <button
              onClick={() =>
                setPartySize(Math.min(selectedMesa.capacidad, partySize + 1))
              }
              className="w-12 h-12 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors flex items-center justify-center text-2xl"
              disabled={partySize >= selectedMesa.capacidad}
            >
              +
            </button>
          </div>
          {partySize > selectedMesa.capacidad && (
            <p className="text-sm text-[#EF4444] text-center mt-4">
              Máximo {selectedMesa.capacidad} personas (capacidad de la mesa)
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="text-[#64748B] hover:text-[#334155] transition-colors flex items-center gap-1"
          >
            ← Volver
          </button>
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton
            onClick={handleNext}
            disabled={!isStep3Valid}
            className="px-8"
          >
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 4: NOTES / SPECIAL REQUESTS
  if (reservationStep === 4) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">Notas y solicitudes especiales</h2>
            <span className="text-sm text-[#64748B]">Paso 4 de 6</span>
          </div>
          <p className="text-[#64748B]">(Opcional)</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            placeholder="Ej: Cumpleaños, sin gluten, mesa cerca de la ventana, etc."
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl resize-none focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
            rows={5}
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-[#64748B]">{notes.length}/200</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="text-[#64748B] hover:text-[#334155] transition-colors flex items-center gap-1"
          >
            ← Volver
          </button>
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton onClick={handleNext} className="px-8">
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 5: REVIEW & CONFIRM
  if (reservationStep === 5) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">Revisa tu reserva</h2>
            <span className="text-sm text-[#64748B]">Paso 5 de 6</span>
          </div>
          <p className="text-[#64748B]">
            Verifica que todo esté correcto antes de confirmar
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Establecimiento</span>
              <div className="text-right">
                <div className="text-[#334155]">
                  {establishment?.name || 'Cargando...'}
                </div>
                {establishment && <TypeBadge type={establishment.type} />}
              </div>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Fecha</span>
              <span className="text-[#334155]">
                {formatDateDisplay(selectedDate)}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Hora</span>
              <span className="text-[#334155]">{selectedTime}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Mesa</span>
              <span className="text-[#334155]">
                {selectedMesa.nombre} (Capacidad: {selectedMesa.capacidad})
              </span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Número de personas</span>
              <span className="text-[#334155]">
                {partySize} {partySize === 1 ? 'persona' : 'personas'}
              </span>
            </div>

            <div className="flex justify-between py-3">
              <span className="text-[#64748B]">Notas especiales</span>
              <span className="text-[#334155] text-right max-w-xs">
                {notes || 'Sin notas especiales'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-xl p-4">
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <PrimaryButton
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full h-12"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Confirmando...
              </span>
            ) : (
              'Confirmar reserva'
            )}
          </PrimaryButton>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="text-[#64748B] hover:text-[#334155] transition-colors disabled:opacity-50"
            >
              Editar
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-[#64748B] hover:text-[#334155] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          <p className="text-sm text-[#64748B] text-center">
            Política de cancelación: puedes cancelar hasta 24 horas antes
          </p>
        </div>
      </div>
    );
  }

  // STEP 6: SUCCESS CONFIRMATION
  if (reservationStep === 6) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
            <Check size={40} className="text-[#22C55E]" />
          </div>
          <h2 className="text-[#334155] mb-2">¡Tu reserva está confirmada!</h2>
          <p className="text-[#64748B]">
            Hemos enviado los detalles a tu correo
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Establecimiento</span>
              <span className="text-[#334155]">
                {establishment?.name || 'Cargando...'}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Fecha</span>
              <span className="text-[#334155]">
                {formatDateDisplay(selectedDate)}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Hora</span>
              <span className="text-[#334155]">{selectedTime}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Mesa</span>
              <span className="text-[#334155]">{selectedMesa.nombre}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Personas</span>
              <span className="text-[#334155]">{partySize}</span>
            </div>

            {reservaCreada?.qrImage ? (
              <div className="pt-3">
                <label className="block text-sm text-[#64748B] mb-4 text-center">
                  Código QR de confirmación
                </label>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-[#F97316]">
                    <img
                      src={reservaCreada.qrImage}
                      alt="Código QR de reserva"
                      className="w-48 h-48"
                    />
                  </div>
                  {reservaCreada.codigoQR && (
                    <div className="text-center">
                      <p className="text-xs text-[#64748B] mb-1">Código:</p>
                      <p className="text-sm font-mono text-[#334155] bg-[#F1F5F9] px-3 py-1 rounded">
                        {reservaCreada.codigoQR}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-[#64748B] text-center max-w-sm">
                    Presenta este código QR al llegar al establecimiento
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-3">
                <label className="block text-sm text-[#64748B] mb-2">
                  Código de confirmación
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={reservaCreada?.codigoQR || 'Generando...'}
                    readOnly
                    className="flex-1 px-4 py-2 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] text-[#334155]"
                  />
                  {reservaCreada?.codigoQR && (
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(reservaCreada.codigoQR)
                      }
                      className="px-4 py-2 text-sm text-[#F97316] hover:text-[#EA580C] transition-colors"
                    >
                      Copiar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SecondaryButton
            onClick={() => router.push('/profile')}
            className="flex-1"
          >
            Ver mis reservas
          </SecondaryButton>
          <PrimaryButton onClick={() => router.push('/')} className="flex-1">
            Ir a inicio
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return null;
}

// Main Component
export default function EstablishmentDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('informacion');
  const [isFavorite, setIsFavorite] = useState(false);

  // Estados para datos de la API
  const [establishment, setEstablishment] =
    useState<DetailedEstablishment | null>(null);
  const [menuData, setMenuData] = useState<any>(null);
  const [opinions, setOpinions] = useState<Review[]>([]);
  const [tables, setTables] = useState<MesaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingOpinions, setIsLoadingOpinions] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserOpinion, setCurrentUserOpinion] =
    useState<UserOpinion | null>(null);
  const [hasLoadedUserOpinion, setHasLoadedUserOpinion] = useState(false);

  // Cargar establecimiento al montar
  useEffect(() => {
    const loadEstablishment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getEstablishment(id);
        setEstablishment(data);
        setOpinions(data.reviews || []);
      } catch (err: any) {
        console.error('Error loading establishment:', err);
        setError(err.message || 'Error al cargar el establecimiento');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadEstablishment();
      // Reset estados cuando cambia el local
      setCurrentUserOpinion(null);
      setHasLoadedUserOpinion(false);
    }
  }, [id]);

  // Cargar menú cuando se abre la pestaña
  useEffect(() => {
    if (activeTab === 'menu' && !menuData && establishment) {
      const loadMenu = async () => {
        try {
          setIsLoadingMenu(true);
          const data = await api.getEstablishmentProducts(id);
          setMenuData(data);
        } catch (err) {
          console.error('Error loading menu:', err);
        } finally {
          setIsLoadingMenu(false);
        }
      };
      loadMenu();
    }
  }, [activeTab, id, menuData, establishment]);

  // Cargar mesas cuando se abre la pestaña de reservas
  useEffect(() => {
    if (activeTab === 'reservas' && tables.length === 0 && establishment) {
      const loadTables = async () => {
        try {
          setIsLoadingTables(true);
          const data = await api.getEstablishmentTables(id);
          setTables(data.mesas || []);
        } catch (err) {
          console.error('Error loading tables:', err);
        } finally {
          setIsLoadingTables(false);
        }
      };
      loadTables();
    }
  }, [activeTab, id, tables.length, establishment]);

  // Cargar opinión del usuario cuando está autenticado y en la pestaña de opiniones
  useEffect(() => {
    if (
      activeTab === 'opiniones' &&
      isLoggedIn &&
      establishment &&
      !hasLoadedUserOpinion
    ) {
      const loadUserOpinion = async () => {
        try {
          const data = await api.getUserOpinionForEstablishment(id);
          setCurrentUserOpinion({
            id: data.id,
            userName: data.usuario,
            rating: data.puntuacion,
            comment: data.comentario,
            date: data.fecha,
          });
        } catch (err: any) {
          // Si devuelve 404, significa que el usuario no tiene opinión para este local (comportamiento esperado)
          if (
            err.status === 404 ||
            err.message?.includes('404') ||
            err.message?.includes('No tienes opinión')
          ) {
            // No hacer nada, es normal no tener opinión
            setCurrentUserOpinion(null);
          } else {
            // Solo mostrar error si es un error real (no 404)
            console.error('Error loading user opinion:', err);
          }
        } finally {
          setHasLoadedUserOpinion(true);
        }
      };
      loadUserOpinion();
    }
  }, [activeTab, isLoggedIn, id, establishment, hasLoadedUserOpinion]);

  const tabs: TabItem[] = [
    { id: '1', label: 'Información', value: 'informacion' },
    { id: '2', label: 'Menú', value: 'menu' },
    { id: '3', label: 'Opiniones', value: 'opiniones' },
    { id: '4', label: 'Reservas', value: 'reservas' },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleReserveClick = () => {
    setActiveTab('reservas');
  };

  const handleSubmitOpinion = async (opinionData: any) => {
    try {
      const response = await api.createOpinion(
        id,
        opinionData.rating,
        opinionData.comment
      );

      // Actualizar la opinión del usuario con los datos recibidos
      if (response.success && response.opinion) {
        setCurrentUserOpinion({
          id: response.opinion.id,
          userName: response.opinion.usuario,
          rating: response.opinion.puntuacion,
          comment: response.opinion.comentario,
          date: response.opinion.fecha,
        });
      }

      // Recargar opiniones del establecimiento
      const data = await api.getEstablishment(id);
      setOpinions(data.reviews || []);
    } catch (err: any) {
      console.error('Error submitting opinion:', err);
      // Mostrar mensaje de error específico
      const errorMessage = err.message?.includes('Ya tienes una opinión')
        ? 'Ya tienes una opinión para este local'
        : err.message || 'Error al enviar la opinión';
      alert(errorMessage);
    }
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[#64748B]">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[#EF4444] mb-4">
            {error || 'Establecimiento no encontrado'}
          </div>
          <button
            onClick={() => router.back()}
            className="text-[#F97316] hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <EstablishmentHeader
        establishment={establishment}
        onBack={handleBack}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
      />

      <QuickInfoBar
        establishment={establishment}
        onReserveClick={handleReserveClick}
        isLoggedIn={isLoggedIn}
      />

      <div className="sticky top-12 z-30 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-6">
          {activeTab === 'informacion' && (
            <InformacionTab
              establishment={establishment}
              hours={establishment.horarios || []}
              photos={establishment.images?.todas || []}
            />
          )}
          {activeTab === 'menu' && (
            <MenuTab
              categories={menuData?.categorias || []}
              isLoading={isLoadingMenu}
            />
          )}
          {activeTab === 'opiniones' && (
            <OpinionesTab
              opinions={opinions}
              currentUserOpinion={currentUserOpinion}
              isLoggedIn={isLoggedIn}
              onSubmitOpinion={handleSubmitOpinion}
              onLoginClick={handleLoginClick}
            />
          )}
          {activeTab === 'reservas' && (
            <ReservasTab
              tables={tables}
              isLoggedIn={isLoggedIn}
              onLoginClick={handleLoginClick}
              establishmentId={id}
              establishment={establishment}
              tablesLoading={isLoadingTables}
            />
          )}
        </div>
      </div>
    </div>
  );
}
