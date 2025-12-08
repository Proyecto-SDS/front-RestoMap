'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';

interface MesaCardProps {
  mesa: Mesa;
  onClick: () => void;
  isEditMode?: boolean;
  onExpire?: () => void;
}

const estadoConfig: Record<
  string,
  { color: string; bgColor: string; label: string; shape: string }
> = {
  DISPONIBLE: {
    color: '#22C55E',
    bgColor: 'bg-green-50',
    label: 'Disponible',
    shape: 'rounded-full',
  },
  RESERVADA: {
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    label: 'Reservada',
    shape: 'rounded-full',
  },
  OCUPADA: {
    color: '#F97316',
    bgColor: 'bg-orange-50',
    label: 'Ocupada',
    shape: 'rounded-lg',
  },
  FUERA_DE_SERVICIO: {
    color: '#94A3B8',
    bgColor: 'bg-slate-50',
    label: 'Fuera de Servicio',
    shape: 'rounded-full',
  },
};

const defaultConfig = {
  color: '#64748B',
  bgColor: 'bg-gray-50',
  label: 'Desconocido',
  shape: 'rounded-full',
};

// Mapa de mesas
// Calcular tiempo restante formateado
function getTiempoRestante(expiracion: string | undefined): {
  texto: string;
  urgente: boolean;
  critico: boolean;
} | null {
  if (!expiracion) return null;

  const ahora = new Date();
  const exp = new Date(expiracion);
  const diffMs = exp.getTime() - ahora.getTime();

  if (diffMs <= 0) {
    return { texto: 'Expirado', urgente: true, critico: true };
  }

  const minutos = Math.floor(diffMs / 60000);
  const segundos = Math.floor((diffMs % 60000) / 1000);

  if (minutos >= 60) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return { texto: `${horas}h ${mins}m`, urgente: false, critico: false };
  }

  if (minutos <= 5) {
    return {
      texto: `${minutos}:${segundos.toString().padStart(2, '0')}`,
      urgente: true,
      critico: true,
    };
  }

  if (minutos <= 15) {
    return { texto: `${minutos} min`, urgente: true, critico: false };
  }

  return { texto: `${minutos} min`, urgente: false, critico: false };
}

export function MesaCard({
  mesa,
  onClick,
  isEditMode = false,
  onExpire,
}: MesaCardProps) {
  const config = estadoConfig[mesa.estado] || defaultConfig;
  const [tiempoInfo, setTiempoInfo] = useState(
    getTiempoRestante(mesa.expiracion)
  );
  const hasExpiredRef = useRef(false);
  const lastExpiracion = useRef(mesa.expiracion);

  // Actualizar tiempo cada segundo si hay expiración
  useEffect(() => {
    // Reset hasExpiredRef cuando cambia la expiración
    if (lastExpiracion.current !== mesa.expiracion) {
      hasExpiredRef.current = false;
      lastExpiracion.current = mesa.expiracion;
    }

    if (!mesa.expiracion) return;

    const interval = setInterval(() => {
      const newInfo = getTiempoRestante(mesa.expiracion);
      setTiempoInfo(newInfo);

      // Detectar cuando el timer llega a 0 y llamar callback
      if (newInfo?.texto === 'Expirado' && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mesa.expiracion, onExpire]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: mesa.id,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderColor: config.color,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative w-full bg-white rounded-xl shadow-sm border-2 p-6
        transition-all duration-200
        ${
          isDragging ? 'shadow-xl z-10' : 'hover:shadow-lg hover:-translate-y-1'
        }
        ${isEditMode ? 'cursor-pointer' : ''}
      `}
    >
      {/* Drag Handle - Solo visible en modo edición */}
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} className="text-[#64748B]" />
        </div>
      )}

      {/* Clickable Area */}
      <button onClick={onClick} className="w-full text-left" type="button">
        {/* Status Indicator */}
        <div className="absolute top-4 right-4">
          <div
            className={`w-3 h-3 ${config.shape}`}
            style={{ backgroundColor: config.color }}
          ></div>
        </div>

        {/* Mesa Name / Capacidad */}
        <h3
          className={`text-xl text-[#334155] mb-2 ${isEditMode ? 'pl-8' : ''}`}
        >
          {mesa.nombre} / {mesa.capacidad} personas
        </h3>

        {/* Descripcion */}
        {mesa.descripcion && (
          <p className="text-sm text-[#94A3B8] mb-3 line-clamp-2">
            {mesa.descripcion}
          </p>
        )}

        {/* Personas en la mesa - Solo si NO es disponible y tiene num_personas */}
        {mesa.estado.toUpperCase() !== 'DISPONIBLE' && mesa.num_personas && (
          <div className="flex items-center gap-2 text-[#64748B] mb-3">
            <Users size={16} />
            <span className="text-sm">
              {mesa.num_personas}{' '}
              {mesa.num_personas === 1 ? 'persona' : 'personas'} en la mesa
            </span>
          </div>
        )}

        {/* Tiempo restante - Solo si está ocupada y tiene expiración */}
        {mesa.estado === 'OCUPADA' && tiempoInfo && (
          <div
            className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg ${
              tiempoInfo.critico
                ? 'bg-red-100 text-red-600'
                : tiempoInfo.urgente
                ? 'bg-orange-100 text-orange-600'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            <Clock size={14} />
            <span className="text-sm font-medium">
              {tiempoInfo.texto} restante
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${config.bgColor}`}
          style={{ color: config.color }}
        >
          {config.label}
        </div>
      </button>
    </div>
  );
}
