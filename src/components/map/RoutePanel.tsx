'use client';

import { Car, Footprints, X } from 'lucide-react';
import type { TransportMode } from '../../services/mapboxRouteService';
import {
  formatDistance,
  formatDuration,
} from '../../services/mapboxRouteService';

interface RoutePanelProps {
  destinationName: string;
  distance: number;
  duration: number;
  mode: TransportMode;
  onModeChange: (mode: TransportMode) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function RoutePanel({
  destinationName,
  distance,
  duration,
  mode,
  onModeChange,
  onClose,
  isLoading = false,
}: RoutePanelProps) {
  const modes: { key: TransportMode; label: string; icon: React.ReactNode }[] =
    [
      { key: 'driving-traffic', label: 'Auto', icon: <Car size={18} /> },
      { key: 'walking', label: 'A pie', icon: <Footprints size={18} /> },
    ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#64748B]">Ruta hacia</p>
          <h3 className="text-sm font-semibold text-[#334155] truncate">
            {destinationName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors ml-2"
          aria-label="Cerrar ruta"
        >
          <X size={18} className="text-[#64748B]" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex border-b border-[#E2E8F0]">
        {modes.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            disabled={isLoading}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors
              ${
                mode === key
                  ? 'bg-[#F97316]/10 text-[#F97316] border-b-2 border-[#F97316]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC]'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Route Info */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-[#64748B]">
              Calculando ruta...
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#334155]">
                {formatDuration(duration)}
              </p>
              <p className="text-xs text-[#64748B]">Tiempo estimado</p>
            </div>
            <div className="w-px h-10 bg-[#E2E8F0]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#334155]">
                {formatDistance(distance)}
              </p>
              <p className="text-xs text-[#64748B]">Distancia</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
