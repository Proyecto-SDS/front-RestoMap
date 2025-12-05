import { Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Mesa } from '../../screens/mesero/DashboardMeseroScreen';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { CreateMesaModal } from './CreateMesaModal';
import { MesaCard } from './MesaCard';

interface TablasMapaProps {
  mesas: Mesa[];
  onMesaUpdate: (mesa: Mesa) => void;
  onMesaCreate: (mesa: Mesa) => void;
  onMesaDelete: (mesaId: string) => void;
  onRefresh?: () => void | Promise<void>;
  readOnly?: boolean;
}

export function TablasMapa({
  mesas,
  onMesaCreate,
  readOnly = false,
}: TablasMapaProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleMesaClick = (mesa: Mesa) => {
    // Navegar a la pagina de detalle de mesa
    router.push(`/dashboard-mesero/mesa/${mesa.id}`);
  };

  // Count active tables - usando estados del backend
  const mesasOcupadas = mesas.filter((m) => m.estado === 'OCUPADA').length;
  const mesasDisponibles = mesas.filter(
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
              <SecondaryButton
                onClick={() => alert('Configurar mapa - Próximamente')}
                size="sm"
              >
                <Settings size={16} />
                Configurar Mapa
              </SecondaryButton>
              <PrimaryButton onClick={() => setShowCreateModal(true)} size="sm">
                <Plus size={16} />
                Nueva Mesa
              </PrimaryButton>
            </div>
          )}
        </div>
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
    </div>
  );
}
