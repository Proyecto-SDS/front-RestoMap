'use client';

import { MapPin } from 'lucide-react';
import type { Establishment } from '../../types';
import { RatingBadge } from '../badges/RatingBadge';
import { StatusBadge } from '../badges/StatusBadge';
import { TypeBadge } from '../badges/TypeBadge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface EstablishmentCardProps {
  establishment: Establishment;
  onClick?: () => void;
}

export function EstablishmentCard({
  establishment,
  onClick,
}: EstablishmentCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        bg-white
        border border-[#E2E8F0]
        rounded-xl
        p-4
        cursor-pointer
        transition-all duration-200
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        hover:-translate-y-0.5
      "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {/* Image */}
      <div className="relative aspect-video w-full mb-3 overflow-hidden rounded-lg">
        <ImageWithFallback
          src={establishment.image}
          alt={establishment.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <TypeBadge type={establishment.type} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Name and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 line-clamp-1">{establishment.name}</h3>
          <RatingBadge
            rating={establishment.rating}
            reviewCount={establishment.reviewCount}
          />
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-[#64748B]">
          <MapPin size={16} className="shrink-0 mt-0.5" />
          <p className="text-sm line-clamp-1">{establishment.address}</p>
        </div>

        {/* Status */}
        <StatusBadge
          status={establishment.status}
          closingTime={establishment.closingTime}
        />
      </div>
    </div>
  );
}
