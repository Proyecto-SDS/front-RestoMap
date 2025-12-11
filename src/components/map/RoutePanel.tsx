'use client';

import { Bike, Car, ChevronUp, Footprints, X } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
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
  onStartNavigation?: () => void; // Callback para zoom/inclinacion en el mapa
  isLoading?: boolean;
}

export function RoutePanel({
  destinationName,
  distance,
  duration,
  mode,
  onModeChange,
  onClose,
  onStartNavigation,
  isLoading = false,
}: RoutePanelProps) {
  const isMobile = useIsMobile();

  const modes: { key: TransportMode; label: string; icon: React.ReactNode }[] =
    [
      { key: 'driving-traffic', label: 'Auto', icon: <Car size={18} /> },
      { key: 'cycling', label: 'Bicicleta', icon: <Bike size={18} /> },
      { key: 'walking', label: 'A pie', icon: <Footprints size={18} /> },
    ];

  // Handler para el boton de navegacion
  const handleNavigationClick = () => {
    if (onStartNavigation) {
      onStartNavigation();
    }
  };

  // Version mobile - Botones circulares con flecha de navegacion
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
        {/* Barra de info compacta */}
        <div className="bg-white/95 backdrop-blur-sm mx-4 mb-3 rounded-2xl shadow-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#64748B]">Ruta hacia</p>
              <h3 className="text-sm font-semibold text-[#334155] truncate">
                {destinationName}
              </h3>
              {!isLoading && (
                <p className="text-xs text-[#64748B] mt-0.5">
                  {formatDuration(duration)} - {formatDistance(distance)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors ml-2"
              aria-label="Cerrar ruta"
            >
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>
        </div>

        {/* Botones de modo de transporte + Boton de navegacion */}
        <div className="flex items-center justify-center gap-3 px-4 pb-4">
          {/* Selector de modos pequeno */}
          <div className="flex bg-white/95 backdrop-blur-sm rounded-full shadow-lg p-1">
            {modes.map(({ key, icon }) => (
              <button
                key={key}
                onClick={() => onModeChange(key)}
                disabled={isLoading}
                className={`
                  p-3 rounded-full transition-all
                  ${
                    mode === key
                      ? 'bg-[#F97316] text-white shadow-md'
                      : 'text-[#64748B] hover:bg-[#F8FAFC]'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label={key}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Boton grande de navegacion con flecha */}
          <button
            onClick={handleNavigationClick}
            disabled={isLoading}
            className={`
              w-16 h-16 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] 
              text-white shadow-xl flex items-center justify-center
              active:scale-95 transition-transform
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label="Enfocar destino"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronUp size={32} strokeWidth={3} />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Version desktop - Panel clasico
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
