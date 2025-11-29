import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SelectDropdown } from '../inputs/SelectDropdown';
import { EmptyState } from './EmptyState';
import { OpinionCard, OpinionData } from './OpinionCard';
import { Pagination } from './Pagination';

interface OpinionesSectionProps {
  opinions: OpinionData[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  sort: string;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  onViewEstablishment: (id: string) => void;
}

export function OpinionesSection({
  opinions,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  sort,
  onPageChange,
  onSortChange,
  onViewEstablishment,
}: OpinionesSectionProps) {
  const router = useRouter();

  const sortOptions = [
    { id: 'recientes', label: 'Más recientes', value: 'recientes' },
    { id: 'mejor', label: 'Mejor calificación', value: 'mejor' },
    { id: 'peor', label: 'Menor calificación', value: 'peor' },
  ];

  if (opinions.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No has dejado opiniones aún"
        subtitle="Comparte tu experiencia con otros usuarios"
        buttonText="Explorar establecimientos"
        onButtonClick={() => router.push('/')}
      />
    );
  }

  return (
    <div>
      {/* Sort */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="max-w-xs">
          <SelectDropdown
            options={sortOptions}
            value={sort}
            onChange={(value) => onSortChange(value)}
            placeholder="Ordenar por"
          />
        </div>
      </div>

      {/* Opinion Cards */}
      <div className="space-y-4">
        {opinions.map((opinion) => (
          <OpinionCard
            key={opinion.id}
            opinion={opinion}
            onViewEstablishment={onViewEstablishment}
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
        label="opiniones"
      />
    </div>
  );
}
