'use client';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Edit3, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { api } from '../../utils/apiClient';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { EditMesaModal } from './EditMesaModal';
import { MesaCard } from './MesaCard';

interface TablasMapaProps {
  mesas: Mesa[];
  onMesaUpdate: (mesa: Mesa) => void;
  onMesaCreate: (mesa: Mesa) => void;
  onMesaDelete: (mesaId: string) => void;
  onMesaSelect?: (mesaId: string) => void;
  onRefresh?: () => void | Promise<void>;
  readOnly?: boolean;
}

export function TablasMapa({
  mesas,
  onMesaUpdate,
  onMesaCreate,
  onMesaDelete,
  onMesaSelect,
  onRefresh,
  readOnly = false,
}: TablasMapaProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [localMesas, setLocalMesas] = useState<Mesa[]>(mesas);
  const [isCreating, setIsCreating] = useState(false);

  // Sincronizar mesas locales cuando cambian las props
  if (JSON.stringify(mesas) !== JSON.stringify(localMesas) && !isEditMode) {
    setLocalMesas(mesas);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localMesas.findIndex((m) => m.id === active.id);
      const newIndex = localMesas.findIndex((m) => m.id === over.id);

      const newMesas = arrayMove(localMesas, oldIndex, newIndex).map(
        (m, idx) => ({
          ...m,
          orden: idx,
        })
      );

      setLocalMesas(newMesas);

      // Guardar nuevo orden en backend
      try {
        await api.empresa.updateMesasOrden(
          newMesas.map((m) => ({ id: Number(m.id), orden: m.orden }))
        );
        // Actualizar estado padre
        newMesas.forEach((m) => onMesaUpdate(m));
      } catch (error) {
        console.error('Error actualizando orden:', error);
      }
    }
  };

  const handleMesaClick = (mesa: Mesa) => {
    if (isEditMode) {
      setEditingMesa(mesa);
    } else if (onMesaSelect) {
      onMesaSelect(mesa.id);
    }
  };

  const handleCreateMesa = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      // Generar nombre secuencial
      const existingNumbers = localMesas
        .map((m) => {
          const match = m.nombre.match(/^Mesa\s*(\d+)$/i);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((n) => n > 0);

      const nextNumber =
        existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const nuevoNombre = `Mesa ${nextNumber}`;

      const response = await api.empresa.createMesa(nuevoNombre, 4);

      const newMesa: Mesa = {
        id: String(response.mesa.id),
        id_empresa: '',
        nombre: response.mesa.nombre,
        descripcion: response.mesa.descripcion || '',
        capacidad: response.mesa.capacidad,
        orden: response.mesa.orden,
        estado: response.mesa.estado.toUpperCase(),
        pedidos_count: 0,
      };

      setLocalMesas((prev) => [...prev, newMesa]);
      onMesaCreate(newMesa);
    } catch (error) {
      console.error('Error creando mesa:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMesaUpdated = (updatedMesa: Mesa) => {
    setLocalMesas((prev) =>
      prev.map((m) => (m.id === updatedMesa.id ? updatedMesa : m))
    );
    onMesaUpdate(updatedMesa);
    setEditingMesa(null);
  };

  const handleMesaDeleted = (mesaId: string) => {
    setLocalMesas((prev) => prev.filter((m) => m.id !== mesaId));
    onMesaDelete(mesaId);
    setEditingMesa(null);
  };

  const toggleEditMode = () => {
    if (isEditMode && onRefresh) {
      onRefresh();
    }
    setIsEditMode(!isEditMode);
  };

  const mesasOcupadas = localMesas.filter((m) => m.estado === 'OCUPADA').length;
  const mesasDisponibles = localMesas.filter(
    (m) => m.estado === 'DISPONIBLE'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl text-[#334155] mb-1">Gestión de Mesas</h2>
            <p className="text-sm text-[#94A3B8]">
              {mesasOcupadas} mesas ocupadas, {mesasDisponibles} disponibles
            </p>
          </div>

          {!readOnly && (
            <div className="flex gap-3">
              {isEditMode ? (
                <SecondaryButton onClick={toggleEditMode} size="sm">
                  <X size={16} />
                  Salir de Edición
                </SecondaryButton>
              ) : (
                <PrimaryButton onClick={toggleEditMode} size="sm">
                  <Edit3 size={16} />
                  Modo Edición
                </PrimaryButton>
              )}
            </div>
          )}
        </div>

        {isEditMode && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Modo Edición activo:</strong> Arrastra las mesas para
              reordenar, haz clic para editar o eliminar, o usa el cuadro
              punteado para agregar una nueva mesa.
            </p>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-sm text-[#64748B] mb-3">Estados de Mesa:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#22C55E] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#3B82F6] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Reservada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F97316] rounded"></div>
            <span className="text-xs text-[#64748B]">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#94A3B8] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Fuera de Servicio</span>
          </div>
        </div>
      </div>

      {/* Tables Grid with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localMesas.map((m) => m.id)}
          strategy={rectSortingStrategy}
          disabled={!isEditMode}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localMesas.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                onClick={() => handleMesaClick(mesa)}
                isEditMode={isEditMode}
              />
            ))}

            {/* Add Mesa Card - Solo visible en modo edición */}
            {isEditMode && (
              <button
                onClick={handleCreateMesa}
                disabled={isCreating}
                className="
                  flex flex-col items-center justify-center
                  min-h-[180px] rounded-xl
                  border-2 border-dashed border-[#CBD5E1]
                  bg-[#F8FAFC] hover:bg-[#F1F5F9]
                  transition-all duration-200
                  hover:border-[#F97316] hover:text-[#F97316]
                  text-[#94A3B8]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Plus size={32} className="mb-2" />
                <span className="text-sm font-medium">
                  {isCreating ? 'Creando...' : 'Agregar Mesa'}
                </span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {localMesas.length === 0 && !isEditMode && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 size={24} className="text-[#94A3B8]" />
          </div>
          <h3 className="text-[#334155] mb-2">No hay mesas configuradas</h3>
          <p className="text-sm text-[#64748B] mb-4">
            Activa el modo edición para crear tu primera mesa
          </p>
          <PrimaryButton onClick={toggleEditMode} size="sm">
            <Edit3 size={16} />
            Modo Edición
          </PrimaryButton>
        </div>
      )}

      {/* Edit Mesa Modal */}
      {editingMesa && (
        <EditMesaModal
          mesa={editingMesa}
          onClose={() => setEditingMesa(null)}
          onMesaUpdate={handleMesaUpdated}
          onMesaDelete={handleMesaDeleted}
        />
      )}
    </div>
  );
}
