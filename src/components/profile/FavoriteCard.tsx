import React from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatRating } from '../../utils/formatters';

export interface FavoriteData {
  id: string;
  establishment: {
    id: string;
    name: string;
    type: 'Restaurante' | 'Restobar' | 'Bar';
    image: string;
    address: string;
    rating: number;
    reviewCount: number;
    status: 'open' | 'closed';
  };
  creado_el: string;
}

interface FavoriteCardProps {
  favorite: FavoriteData;
  onVisit: (id: string) => void;
  onRemove: (id: string) => void;
}

export function FavoriteCard({ favorite, onVisit, onRemove }: FavoriteCardProps) {
  const getTypeBadgeColor = (type: string) => {
    const colors = {
      Restaurante: 'bg-gradient-to-r from-[#F97316] to-[#FB923C]',
      Restobar: 'bg-gradient-to-r from-[#EF4444] to-[#F97316]',
      Bar: 'bg-gradient-to-r from-[#DC2626] to-[#EF4444]',
    };
    return colors[type as keyof typeof colors] || colors.Restaurante;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <ImageWithFallback
          src={favorite.establishment.image}
          alt={favorite.establishment.name}
          className="w-full h-full object-cover"
        />
        {/* Favorite heart */}
        <button
          onClick={() => onRemove(favorite.id)}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors group"
          aria-label="Quitar de favoritos"
        >
          <Heart size={20} className="fill-[#EF4444] text-[#EF4444] group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="text-[#334155] mb-2">{favorite.establishment.name}</h4>
        
        <span className={`inline-block text-xs px-2 py-1 rounded text-white mb-3 ${getTypeBadgeColor(favorite.establishment.type)}`}>
          {favorite.establishment.type}
        </span>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-[#64748B] mb-2">
          <MapPin size={16} className="flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{favorite.establishment.address}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#22C55E]/10 rounded">
            <Star size={14} className="fill-[#22C55E] text-[#22C55E]" />
            <span className="text-sm text-[#22C55E]">
              {formatRating(favorite.establishment.rating)}
            </span>
          </div>
          <span className="text-xs text-[#94A3B8]">
            ({favorite.establishment.reviewCount} opiniones)
          </span>
        </div>

        {/* Status */}
        <div className="mb-4">
          <span className={`text-xs px-2 py-1 rounded ${
            favorite.establishment.status === 'open'
              ? 'bg-[#22C55E]/10 text-[#22C55E]'
              : 'bg-[#94A3B8]/10 text-[#94A3B8]'
          }`}>
            {favorite.establishment.status === 'open' ? 'Abierto' : 'Cerrado'}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <PrimaryButton
            size="sm"
            onClick={() => onVisit(favorite.establishment.id)}
            className="w-full"
          >
            Visitar
          </PrimaryButton>
          <SecondaryButton
            size="sm"
            onClick={() => onRemove(favorite.id)}
            className="w-full"
          >
            Quitar de favoritos
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
