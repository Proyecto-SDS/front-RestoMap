import { Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { CreateMesaModal } from './CreateMesaModal';
import { MesaActionModal } from './MesaActionModal';
import { MesaCard } from './MesaCard';

interface TablasMapaProps {
  mesas: Mesa[];
  onMesaUpdate: (mesa: Mesa) => void;
  onMesaCreate: (mesa: Mesa) => void;
  onMesaDelete: (mesaId: string) => void;
  onRefresh?: () => void | Promise<void>;
}

export function TablasMapa({ mesas, onMesaUpdate, onMesaCreate, onMesaDelete }: TablasMapaProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const handleMesaClick = (mesa: Mesa) => {
    setSelectedMesa(mesa);
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedMesa(null);
  };

  // Count active tables
  const mesasOcupadas = mesas.filter(m => ['OCUPADA', 'PIDIENDO', 'EN_COCINA', 'COMIENDO', 'PIDIENDO_CUENTA'].includes(m.estado)).length;
  const mesasDisponibles = mesas.filter(m => m.estado === 'DISPONIBLE').length;

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

          <div className="flex gap-3">
            <SecondaryButton onClick={() => alert('Configurar mapa - Próximamente')} size="sm">
              <Settings size={16} />
              Configurar Mapa
            </SecondaryButton>
            <PrimaryButton onClick={() => setShowCreateModal(true)} size="sm">
              <Plus size={16} />
              Nueva Mesa
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-sm text-[#64748B] mb-3">Estados de Mesa:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#22C55E] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F97316] rounded"></div>
            <span className="text-xs text-[#64748B]">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#3B82F6] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Pidiendo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#8B5CF6] rounded-full"></div>
            <span className="text-xs text-[#64748B]">En Cocina</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FBBF24] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Comiendo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#EF4444] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Pidiendo Cuenta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#94A3B8] rounded-full"></div>
            <span className="text-xs text-[#64748B]">Pagado</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            onClick={() => handleMesaClick(mesa)}
          />
        ))}
      </div>

      {/* Empty State */}
      {mesas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings size={24} className="text-[#94A3B8]" />
          </div>
          <h3 className="text-[#334155] mb-2">No hay mesas configuradas</h3>
          <p className="text-sm text-[#64748B] mb-4">
            Crea tu primera mesa para empezar a gestionar el restaurante
          </p>
          <PrimaryButton onClick={() => setShowCreateModal(true)} size="sm">
            <Plus size={16} />
            Crear Primera Mesa
          </PrimaryButton>
        </div>
      )}

      {/* Create Mesa Modal */}
      {showCreateModal && (
        <CreateMesaModal
          onClose={() => setShowCreateModal(false)}
          onMesaCreate={onMesaCreate}
        />
      )}

      {/* Mesa Action Modal */}
      {showActionModal && selectedMesa && (
        <MesaActionModal
          mesa={selectedMesa}
          onClose={handleCloseActionModal}
          onMesaUpdate={onMesaUpdate}
          onMesaDelete={onMesaDelete}
        />
      )}
    </div>
  );
}
