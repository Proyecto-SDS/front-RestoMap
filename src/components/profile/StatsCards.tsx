import { Calendar, Heart, Receipt, Star } from 'lucide-react';

interface Stats {
  activeReservations: number;
  totalOpinions: number;
  totalFavorites: number;
  totalHistorial?: number;
}

interface StatsCardsProps {
  stats: Stats;
  onCardClick: (
    section: 'reservas' | 'opiniones' | 'favoritos' | 'historial'
  ) => void;
}

export function StatsCards({ stats, onCardClick }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Active Reservations */}
      <button
        onClick={() => onCardClick('reservas')}
        className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Calendar size={20} className="text-[#F97316]" />
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-[#334155] mb-0.5">
          {stats.activeReservations}
        </div>
        <div className="text-[10px] sm:text-xs text-[#94A3B8]">Reservas</div>
      </button>

      {/* Total Opinions */}
      <button
        onClick={() => onCardClick('opiniones')}
        className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Star size={20} className="text-[#3B82F6]" />
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-[#334155] mb-0.5">
          {stats.totalOpinions}
        </div>
        <div className="text-[10px] sm:text-xs text-[#94A3B8]">Opiniones</div>
      </button>

      {/* Total Favorites */}
      <button
        onClick={() => onCardClick('favoritos')}
        className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Heart size={20} className="text-[#EF4444]" />
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-[#334155] mb-0.5">
          {stats.totalFavorites}
        </div>
        <div className="text-[10px] sm:text-xs text-[#94A3B8]">Favoritos</div>
      </button>

      {/* Historial */}
      <button
        onClick={() => onCardClick('historial')}
        className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Receipt size={20} className="text-[#22C55E]" />
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-[#334155] mb-0.5">
          {stats.totalHistorial ?? '-'}
        </div>
        <div className="text-[10px] sm:text-xs text-[#94A3B8]">Historial</div>
      </button>
    </div>
  );
}
