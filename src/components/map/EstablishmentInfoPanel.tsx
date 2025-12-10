'use client';

import { MapPin, Navigation, Star, X } from 'lucide-react';

import type { Establishment } from '../../types';
import { StatusBadge } from '../badges/StatusBadge';
import { TypeBadge } from '../badges/TypeBadge';

interface EstablishmentInfoPanelProps {
  establishment: Establishment;
  onClose: () => void;
  onGetDirections: () => void;
  hasUserLocation: boolean;
}

export function EstablishmentInfoPanel({
  establishment,
  onClose,
  onGetDirections,
  hasUserLocation,
}: EstablishmentInfoPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm w-full">
      {/* Header with close button */}
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow transition-colors z-10"
          aria-label="Cerrar"
        >
          <X size={16} className="text-[#64748B]" />
        </button>

        {/* Mini image header - more compact */}
        <div className="h-14 bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center px-3">
          <div className="flex-1">
            <TypeBadge type={establishment.type} />
          </div>
        </div>
      </div>

      {/* Content - more compact */}
      <div className="p-3">
        {/* Name and Status */}
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-base font-semibold text-[#334155] line-clamp-1 flex-1">
            {establishment.name}
          </h3>
          <div className="ml-2 shrink-0">
            <StatusBadge
              status={establishment.status}
              closingTime={establishment.closingTime}
            />
          </div>
        </div>

        {/* Rating */}
        {establishment.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="fill-[#F97316] text-[#F97316]" />
            <span className="text-xs font-medium text-[#334155]">
              {establishment.rating}
            </span>
            <span className="text-xs text-[#64748B]">
              ({establishment.reviewCount} opiniones)
            </span>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-1.5 mb-3">
          <MapPin size={14} className="text-[#F97316] shrink-0 mt-0.5" />
          <p className="text-xs text-[#64748B] line-clamp-1">
            {establishment.address}, {establishment.commune}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onGetDirections}
          disabled={!hasUserLocation}
          className={`
            w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              hasUserLocation
                ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
            }
          `}
          title={!hasUserLocation ? 'Activa tu ubicación para ver rutas' : ''}
        >
          <Navigation size={14} />
          <span>Cómo llegar</span>
        </button>

        {/* Location warning */}
        {!hasUserLocation && (
          <p className="mt-1.5 text-[10px] text-[#94A3B8] text-center">
            Activa tu ubicación para calcular rutas
          </p>
        )}
      </div>
    </div>
  );
}
