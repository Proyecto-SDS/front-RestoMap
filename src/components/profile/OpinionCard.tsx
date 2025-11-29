import React, { useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { getRelativeTime } from '../../utils/formatters';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface OpinionData {
  id: string;
  establishment: {
    id: string;
    name: string;
    type: 'Restaurante' | 'Restobar' | 'Bar';
    image: string;
  };
  puntuacion: number;
  comentario: string;
  creado_el: string;
}

interface OpinionCardProps {
  opinion: OpinionData;
  onViewEstablishment: (id: string) => void;
}

export function OpinionCard({ opinion, onViewEstablishment }: OpinionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const shouldTruncate = opinion.comentario.length > maxLength;
  const displayText = isExpanded || !shouldTruncate
    ? opinion.comentario
    : `${opinion.comentario.slice(0, maxLength)}...`;

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      Restaurante: 'bg-gradient-to-r from-[#F97316] to-[#FB923C]',
      Restobar: 'bg-gradient-to-r from-[#EF4444] to-[#F97316]',
      Bar: 'bg-gradient-to-r from-[#DC2626] to-[#EF4444]',
    };
    return colors[type as keyof typeof colors] || colors.Restaurante;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="relative w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={opinion.establishment.image}
            alt={opinion.establishment.name}
            className="w-full h-full object-cover"
          />
          <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded text-white ${getTypeBadgeColor(opinion.establishment.type)}`}>
            {opinion.establishment.type}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-[#334155]">{opinion.establishment.name}</h4>
          </div>

          {/* Rating */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= opinion.puntuacion ? 'fill-[#F97316] text-[#F97316]' : 'text-[#E2E8F0]'}
              />
            ))}
          </div>

          {/* Comment */}
          <p className="text-sm text-[#64748B] italic mb-2">
            "{displayText}"
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-[#F97316] hover:underline mb-2"
            >
              {isExpanded ? 'Menos' : 'Leer más'}
            </button>
          )}

          {/* Date */}
          <p className="text-xs text-[#94A3B8] mb-3">
            Publicada {getRelativeTime(opinion.creado_el)}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <SecondaryButton
              size="sm"
              onClick={() => onViewEstablishment(opinion.establishment.id)}
            >
              <ExternalLink size={14} />
              Ver en local
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
