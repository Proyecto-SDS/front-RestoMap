import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SelectDropdown } from '../inputs/SelectDropdown';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { ReservationCard, ReservationData } from './ReservationCard';

interface ReservasSectionProps {
  reservations: ReservationData[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  filter: string;
  sort: string;
  onPageChange: (page: number) => void;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onViewDetails: (reservation: ReservationData) => void;
  onCancel: (id: string) => void;
}

export function ReservasSection({
  reservations,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  filter,
  sort,
  onPageChange,
  onFilterChange,
  onSortChange,
  onViewDetails,
  onCancel,
}: ReservasSectionProps) {
  const router = useRouter();

  const filterOptions = [
    { id: 'todas', label: 'Todas', value: 'todas' },
    { id: 'proximas', label: 'Próximas', value: 'proximas' },
    { id: 'pasadas', label: 'Pasadas', value: 'pasadas' },
    { id: 'canceladas', label: 'Canceladas', value: 'canceladas' },
  ];

  const sortOptions = [
    { id: 'recientes', label: 'Más recientes', value: 'recientes' },
    { id: 'fecha', label: 'Fecha de reserva', value: 'fecha' },
  ];

  if (reservations.length === 0 && filter === 'todas') {
    return (
      <EmptyState
        icon={Calendar}
        title="No tienes reservas registradas"
        subtitle="Comienza a reservar en tus establecimientos favoritos"
        buttonText="Explorar establecimientos"
        onButtonClick={() => router.push('/')}
      />
    );
  }

  return (
    <div>
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 sticky top-0 bg-[#F1F5F9] py-4 z-10">
        <div className="flex-1">
          <SelectDropdown
            options={filterOptions}
            value={filter}
            onChange={(value) => onFilterChange(value)}
            placeholder="Filtrar por estado"
          />
        </div>
        <div className="flex-1">
          <SelectDropdown
            options={sortOptions}
            value={sort}
            onChange={(value) => onSortChange(value)}
            placeholder="Ordenar por"
          />
        </div>
      </div>

      {/* Reservation Cards */}
      {reservations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onViewDetails={onViewDetails}
                onCancel={onCancel}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            label="reservas"
          />
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Calendar size={48} className="text-[#CBD5E1] mx-auto mb-4" />
          <p className="text-[#64748B]">
            No se encontraron reservas con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
}
