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

        {/* Mini image header */}
        <div className="h-20 bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center px-4">
          <div className="flex-1">
            <TypeBadge type={establishment.type} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Status */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-[#334155] line-clamp-2 flex-1">
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
          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="fill-[#F97316] text-[#F97316]" />
            <span className="text-sm font-medium text-[#334155]">
              {establishment.rating}
            </span>
            <span className="text-sm text-[#64748B]">
              ({establishment.reviewCount} opiniones)
            </span>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 mb-4">
          <MapPin size={16} className="text-[#F97316] shrink-0 mt-0.5" />
          <p className="text-sm text-[#64748B]">
            {establishment.address}, {establishment.commune}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4">
          <button
            onClick={onGetDirections}
            disabled={!hasUserLocation}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${
                hasUserLocation
                  ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              }
            `}
            title={!hasUserLocation ? 'Activa tu ubicación para ver rutas' : ''}
          >
            <Navigation size={16} />
            <span>Cómo llegar</span>
          </button>
        </div>

        {/* Location warning */}
        {!hasUserLocation && (
          <p className="mt-2 text-xs text-[#94A3B8] text-center">
            Activa tu ubicación para calcular rutas
          </p>
        )}
      </div>
    </div>
  );
}
