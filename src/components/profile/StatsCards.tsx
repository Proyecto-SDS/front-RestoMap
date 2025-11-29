import { Calendar, Heart, Star } from 'lucide-react';

interface Stats {
  activeReservations: number;
  totalOpinions: number;
  totalFavorites: number;
}

interface StatsCardsProps {
  stats: Stats;
  onCardClick: (section: 'reservas' | 'opiniones' | 'favoritos') => void;
}

export function StatsCards({ stats, onCardClick }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Active Reservations */}
      <button
        onClick={() => onCardClick('reservas')}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Calendar size={24} className="text-[#F97316]" />
        </div>
        <div className="text-3xl text-[#334155] mb-1">
          {stats.activeReservations}
        </div>
        <div className="text-xs text-[#94A3B8]">Reservas activas</div>
      </button>

      {/* Total Opinions */}
      <button
        onClick={() => onCardClick('opiniones')}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Star size={24} className="text-[#3B82F6]" />
        </div>
        <div className="text-3xl text-[#334155] mb-1">
          {stats.totalOpinions}
        </div>
        <div className="text-xs text-[#94A3B8]">Opiniones</div>
      </button>

      {/* Total Favorites */}
      <button
        onClick={() => onCardClick('favoritos')}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Heart size={24} className="text-[#EF4444]" />
        </div>
        <div className="text-3xl text-[#334155] mb-1">
          {stats.totalFavorites}
        </div>
        <div className="text-xs text-[#94A3B8]">Favoritos</div>
      </button>
    </div>
  );
}
