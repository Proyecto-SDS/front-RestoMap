'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Users } from 'lucide-react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';

interface MesaCardProps {
  mesa: Mesa;
  onClick: () => void;
  isEditMode?: boolean;
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

export function MesaCard({ mesa, onClick, isEditMode = false }: MesaCardProps) {
  const config = estadoConfig[mesa.estado] || defaultConfig;

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

        {/* Personas en la mesa - Solo si NO es disponible */}
        {mesa.estado !== 'DISPONIBLE' && mesa.num_personas && (
          <div className="flex items-center gap-2 text-[#64748B] mb-3">
            <Users size={16} />
            <span className="text-sm">
              {mesa.num_personas}{' '}
              {mesa.num_personas === 1 ? 'persona' : 'personas'} en la mesa
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
