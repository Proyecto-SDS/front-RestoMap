import { Star } from 'lucide-react';
import { formatRating } from '../../utils/formatters';

export interface RatingBadgeProps {
  rating: number | null;
  reviewCount?: number;
  showCount?: boolean;
}

export function RatingBadge({
  rating,
  reviewCount,
  showCount = true,
}: RatingBadgeProps) {
  if (rating === null || rating === undefined) {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="text-sm text-[#64748B]">Sin calificación</span>
        {showCount && reviewCount !== undefined && (
          <span className="text-sm text-[#64748B]">({reviewCount})</span>
        )}
      </div>
    );
  }

  const isExcellent = rating >= 4.5;
  const color = isExcellent ? '#22C55E' : '#F97316';

  return (
    <div className="inline-flex items-center gap-1">
      <Star size={16} fill={color} stroke={color} />
      <span className="text-sm" style={{ color }}>
        {formatRating(rating)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className="text-sm text-[#64748B]">({reviewCount})</span>
      )}
    </div>
  );
}
