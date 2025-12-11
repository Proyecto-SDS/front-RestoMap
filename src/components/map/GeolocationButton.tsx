'use client';

import { Loader2, LocateFixed, LocateOff } from 'lucide-react';

interface GeolocationButtonProps {
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'error';
  onRequestLocation: () => void;
  onCenterOnUser: () => void;
  error?: string | null;
}

export function GeolocationButton({
  status,
  onRequestLocation,
  onCenterOnUser,
  error,
}: GeolocationButtonProps) {
  const handleClick = () => {
    if (status === 'granted') {
      onCenterOnUser();
    } else if (status !== 'loading') {
      onRequestLocation();
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 size={20} className="animate-spin text-[#3B82F6]" />;
      case 'denied':
      case 'error':
        return <LocateOff size={20} className="text-[#EF4444]" />;
      case 'granted':
        return <LocateFixed size={20} className="text-[#3B82F6]" />;
      default:
        return <LocateFixed size={20} className="text-[#64748B]" />;
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'loading':
        return 'Obteniendo ubicación...';
      case 'denied':
        return 'Ubicación denegada';
      case 'error':
        return error || 'Error de ubicación';
      case 'granted':
        return 'Centrar en mi ubicación';
      default:
        return 'Mostrar mi ubicación';
    }
  };

  const isDisabled = status === 'loading';
  const showWarning = status === 'denied' || status === 'error';

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          p-3 bg-white rounded-xl shadow-lg transition-all
          ${
            isDisabled
              ? 'cursor-not-allowed opacity-70'
              : 'hover:shadow-xl hover:bg-[#F8FAFC]'
          }
          ${showWarning ? 'ring-2 ring-[#EF4444]/20' : ''}
        `}
        aria-label={getTooltip()}
      >
        {getIcon()}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#1E293B] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {getTooltip()}
        <div className="absolute top-full right-4 border-4 border-transparent border-t-[#1E293B]" />
      </div>
    </div>
  );
}
