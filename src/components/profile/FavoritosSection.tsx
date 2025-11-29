import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SelectDropdown } from '../inputs/SelectDropdown';
import { EmptyState } from './EmptyState';
import { FavoriteCard, FavoriteData } from './FavoriteCard';
import { Pagination } from './Pagination';

interface FavoritosSectionProps {
  favorites: FavoriteData[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  sort: string;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  onVisit: (id: string) => void;
  onRemove: (id: string) => void;
}

export function FavoritosSection({
  favorites,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  sort,
  onPageChange,
  onSortChange,
  onVisit,
  onRemove,
}: FavoritosSectionProps) {
  const router = useRouter();

  const sortOptions = [
    { id: 'recientes', label: 'Más recientes', value: 'recientes' },
    { id: 'nombre_az', label: 'Nombre A-Z', value: 'nombre_az' },
    { id: 'nombre_za', label: 'Nombre Z-A', value: 'nombre_za' },
    { id: 'rating', label: 'Mejor calificación', value: 'rating' },
  ];

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No tienes favoritos guardados"
        subtitle="Guarda tus establecimientos favoritos para acceder rápido"
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

      {/* Favorite Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((favorite) => (
          <FavoriteCard
            key={favorite.id}
            favorite={favorite}
            onVisit={onVisit}
            onRemove={onRemove}
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
        label="favoritos"
      />
    </div>
  );
}
