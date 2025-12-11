'use client';

import {
  BarChart3,
  Calendar,
  ChefHat,
  Eye,
  History,
  Package,
  Settings,
  Users,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { KanbanBoard } from '../../components/cocinero/KanbanBoard';
import { EditEmployeeModal } from '../../components/gerente/EditEmployeeModal';
import { EmployeeManagement } from '../../components/gerente/EmployeeManagement';
import HistorialPedidos from '../../components/gerente/HistorialPedidos';
import { InviteEmployeeModal } from '../../components/gerente/InviteEmployeeModal';
import { LocalConfigManager } from '../../components/gerente/LocalConfigManager';
import { MetricsDashboard } from '../../components/gerente/MetricsDashboard';
import { ProductosManagement } from '../../components/gerente/ProductosManagement';
import { MesaDetailContent } from '../../components/mesero/MesaDetailContent';
import { ReservasManagement } from '../../components/mesero/ReservasManagement';
import { TablasMapa } from '../../components/mesero/TablasMapa';

import {
  MiPerfilEmpleado,
  PanelSidebar,
  PanelTopNav,
} from '../../components/panel';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../utils/apiClient';
import type { Pedido as PedidoKanban } from '../cocinero/DashboardCocineroScreen';
import type { Mesa, MesaEstado } from '../mesero/DashboardMeseroScreen';

interface Empleado {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: string;
  creado_el: string;
}

export default function DashboardGerenteScreen() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [dateRange, setDateRange] = useState<string>('mes');
  const [showProfile, setShowProfile] = useState(false);
  const [activeSection, setActiveSection] = useState<
    | 'empleados'
    | 'metricas'
    | 'panel-mesero'
    | 'panel-cocina'
    | 'panel-bartender'
    | 'panel-reservas'
    | 'historial'
    | 'inventario'
    | 'configuracion'
  >('configuracion');
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidosCocina, setPedidosCocina] = useState<{
    tomados: PedidoKanban[];
    en_proceso: PedidoKanban[];
    listos: PedidoKanban[];
  }>({ tomados: [], en_proceso: [], listos: [] });
  const [pedidosBarra, setPedidosBarra] = useState<{
    tomados: PedidoKanban[];
    en_proceso: PedidoKanban[];
    listos: PedidoKanban[];
  }>({ tomados: [], en_proceso: [], listos: [] });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);

  // Cargar mesas
  const loadMesas = async () => {
    try {
      const mesasData = await api.empresa.getMesas();
      setMesas(
        mesasData
          .map((m: Record<string, unknown>) => ({
            id: String(m.id),
            id_empresa: String(m.id_local),
            nombre: m.nombre as string,
            descripcion: (m.descripcion as string) || '',
            capacidad: m.capacidad as number,
            orden: (m.orden as number) ?? 0,
            estado: (m.estado as string).toUpperCase() as MesaEstado,
            pedidos_count: m.pedidos_count as number,
            num_personas: (m.num_personas as number) || undefined,
            expiracion: (m.expiracion as string) || undefined,
          }))
          .sort((a: Mesa, b: Mesa) => a.orden - b.orden) as Mesa[]
      );
    } catch (error) {
      console.error('Error loading mesas:', error);
    }
  };

  // Cargar pedidos de cocina
  const loadPedidosCocina = async () => {
    try {
      const data = await api.empresa.getPedidosCocina();
      const pedidosList = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        id_mesa: String(p.id_mesa),
        mesa_nombre: p.mesa_nombre as string,
        fecha_pedido: p.creado_el as string,
        total: (p.total as number) || 0,
        estado: ((p.estado as string) || 'INICIADO').toUpperCase(),
        creado_el: p.creado_el as string,
        lineas:
          (p.lineas as Array<Record<string, unknown>>)?.map((l) => ({
            id: String(l.id),
            id_pedido: String(p.id),
            id_producto: String(l.producto_id),
            producto_nombre: l.producto_nombre as string,
            cantidad: l.cantidad as number,
            precio_unitario: l.precio_unitario as number,
          })) || [],
      })) as PedidoKanban[];
      setPedidosCocina({
        tomados: pedidosList.filter((p) => p.estado === 'RECEPCION'),
        en_proceso: pedidosList.filter((p) => p.estado === 'EN_PROCESO'),
        listos: pedidosList.filter((p) => p.estado === 'TERMINADO'),
      });
    } catch (error) {
      console.error('Error loading pedidos cocina:', error);
    }
  };

  // Cargar pedidos de barra
  const loadPedidosBarra = async () => {
    try {
      const data = await api.empresa.getPedidosBarra();
      const pedidosList = data.map((p: Record<string, unknown>) => ({
        id: String(p.id),
        id_mesa: String(p.id_mesa),
        mesa_nombre: p.mesa_nombre as string,
        fecha_pedido: p.creado_el as string,
        total: (p.total as number) || 0,
        estado: ((p.estado as string) || 'INICIADO').toUpperCase(),
        creado_el: p.creado_el as string,
        lineas:
          (p.lineas as Array<Record<string, unknown>>)?.map((l) => ({
            id: String(l.id),
            id_pedido: String(p.id),
            id_producto: String(l.producto_id),
            producto_nombre: l.producto_nombre as string,
            cantidad: l.cantidad as number,
            precio_unitario: l.precio_unitario as number,
          })) || [],
      })) as PedidoKanban[];
      setPedidosBarra({
        tomados: pedidosList.filter((p) => p.estado === 'RECEPCION'),
        en_proceso: pedidosList.filter((p) => p.estado === 'EN_PROCESO'),
        listos: pedidosList.filter((p) => p.estado === 'TERMINADO'),
      });
    } catch (error) {
      console.error('Error loading pedidos barra:', error);
    }
  };

  // Cargar mesas y pedidos cuando se navega a paneles
  useEffect(() => {
    const loadPanelData = async () => {
      if (
        activeSection === 'panel-mesero' ||
        activeSection === 'panel-reservas'
      ) {
        await loadMesas();
      }
      if (activeSection === 'panel-cocina') {
        await loadPedidosCocina();
      }
      if (activeSection === 'panel-bartender') {
        await loadPedidosBarra();
      }
    };
    loadPanelData();
  }, [activeSection]);

  // WebSocket listeners para mantener estados en vivo
  useEffect(() => {
    if (!socket) return;

    // Handler para actualización de estado de mesa
    const handleMesaUpdate = () => {
      if (activeSection === 'panel-mesero') {
        loadMesas();
      }
    };

    // Handler para actualización de pedidos
    const handlePedidoUpdate = () => {
      if (activeSection === 'panel-cocina') {
        loadPedidosCocina();
      }
      if (activeSection === 'panel-bartender') {
        loadPedidosBarra();
      }
    };

    socket.on('mesa_status_changed', handleMesaUpdate);
    socket.on('pedido_actualizado', handlePedidoUpdate);
    socket.on('nuevo_pedido', handlePedidoUpdate);

    return () => {
      socket.off('mesa_status_changed', handleMesaUpdate);
      socket.off('pedido_actualizado', handlePedidoUpdate);
      socket.off('nuevo_pedido', handlePedidoUpdate);
    };
  }, [socket, activeSection]);

  // Cargar empleados desde API
  useEffect(() => {
    const loadEmpleados = async () => {
      try {
        const data = await api.empresa.getEmpleados();
        const empleadosList = data.map((e: Record<string, unknown>) => ({
          id: String(e.id),
          nombre: e.nombre as string,
          correo: e.correo as string,
          telefono: (e.telefono as string) || '',
          rol: e.rol as string,
          creado_el: (e.creado_el as string) || '',
        })) as Empleado[];
        setEmpleados(empleadosList);
      } catch (error) {
        console.error('Error loading empleados:', error);
      }
    };
    loadEmpleados();
  }, []);

  // Calcular stats derivados de empleados usando useMemo
  // TODO: Implementar uso de stats en el dashboard
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stats = useMemo(() => {
    return {
      ventasHoy: 0,
      trendVentas: 0,
      ordenesHoy: 0,
      ordenesEnProceso: 0,
      empleadosTotal: empleados.length,
      empleadosActivos: empleados.length,
      empleadosInactivos: 0,
      clientesHoy: 0,
      clientesNuevos: 0,
    };
  }, [empleados]);

  const handleInviteSuccess = () => {
    // Refresh empleados list
  };

  const handleEditSuccess = () => {
    // Refresh empleados list
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;

    try {
      // Llamar a la API para remover el empleado del local
      await api.empresa.deleteEmpleado(Number(showDeleteConfirm));

      setEmpleados((prev) =>
        prev.filter((emp) => emp.id !== showDeleteConfirm)
      );
      setShowDeleteConfirm(null);
    } catch {
      console.error('Error al remover empleado');
    }
  };

  const menuItems = [
    {
      id: 'configuracion' as const,
      label: 'Información del Local',
      icon: Settings,
    },
    {
      id: 'empleados' as const,
      label: 'Empleados',
      icon: Users,
    },
    {
      id: 'metricas' as const,
      label: 'Métricas',
      icon: BarChart3,
    },
    {
      id: 'inventario' as const,
      label: 'Inventario',
      icon: Package,
    },
    {
      id: 'panel-reservas' as const,
      label: 'Reservas',
      icon: Calendar,
    },
    {
      id: 'historial' as const,
      label: 'Historial',
      icon: History,
    },
    {
      id: 'panel-mesero' as const,
      label: 'Panel Mesero',
      icon: UtensilsCrossed,
    },
    {
      id: 'panel-cocina' as const,
      label: 'Panel Cocina',
      icon: ChefHat,
    },
    {
      id: 'panel-bartender' as const,
      label: 'Panel Barra',
      icon: Wine,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#1a1f2e' }}
    >
      {/* Sidebar */}
      <PanelSidebar
        title="RestoMap"
        subtitle="Panel Gerente"
        icon={Settings}
        menuItems={menuItems}
        activeItem={activeSection}
        onNavigate={(id) => {
          setActiveSection(id as typeof activeSection);
          setSelectedMesaId(null);
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <PanelTopNav
          panelName="Panel de Gerente"
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          pageTitle={
            activeSection === 'configuracion'
              ? 'Información del Local'
              : activeSection === 'empleados'
              ? 'Empleados'
              : activeSection === 'metricas'
              ? 'Métricas'
              : activeSection === 'inventario'
              ? 'Inventario'
              : activeSection === 'panel-reservas'
              ? 'Reservas'
              : activeSection === 'historial'
              ? 'Historial'
              : activeSection === 'panel-mesero'
              ? 'Panel Mesero (Solo Lectura)'
              : activeSection === 'panel-cocina'
              ? 'Panel Cocina (Solo Lectura)'
              : 'Panel Barra (Solo Lectura)'
          }
          pageDescription="Vista del gerente"
          user={user}
          onOpenProfile={() => setShowProfile(true)}
        />

        {/* Content Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Main content area */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-[#F8FAFC]">
            {/* Empleados Section */}
            {activeSection === 'empleados' && (
              <>
                <EmployeeManagement
                  empleados={empleados}
                  onInvite={() => setShowInviteModal(true)}
                  onEdit={(empleado) => setEditingEmpleado(empleado)}
                  onDelete={(id) => setShowDeleteConfirm(id)}
                />
              </>
            )}

            {/* Metricas Section */}
            {activeSection === 'metricas' && (
              <MetricsDashboard
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}

            {/* Panel Mesero - Solo Visualizacion */}
            {activeSection === 'panel-mesero' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Eye size={20} className="text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Modo visualizacion:</strong> Estas viendo el panel
                    del mesero en modo solo lectura.
                  </p>
                </div>
                {selectedMesaId ? (
                  <MesaDetailContent
                    mesaId={selectedMesaId}
                    onVolver={() => setSelectedMesaId(null)}
                    readOnly={true}
                  />
                ) : (
                  <TablasMapa
                    mesas={mesas}
                    onMesaUpdate={() => {}}
                    onMesaCreate={() => {}}
                    onMesaDelete={() => {}}
                    onMesaSelect={(mesaId) => setSelectedMesaId(mesaId)}
                    readOnly={true}
                  />
                )}
              </div>
            )}

            {/* Panel Cocina - Solo Visualizacion */}
            {activeSection === 'panel-cocina' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Eye size={20} className="text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Modo visualizacion:</strong> Estas viendo el panel
                    de cocina en modo solo lectura.
                  </p>
                </div>
                <KanbanBoard
                  pedidos={pedidosCocina}
                  onPedidoUpdate={() => {}}
                  onRefresh={loadPedidosCocina}
                  readOnly={true}
                />
              </div>
            )}

            {/* Panel Bartender - Solo Visualizacion */}
            {activeSection === 'panel-bartender' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Eye size={20} className="text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Modo visualizacion:</strong> Estas viendo el panel
                    de barra en modo solo lectura.
                  </p>
                </div>
                <KanbanBoard
                  pedidos={pedidosBarra}
                  onPedidoUpdate={() => {}}
                  onRefresh={loadPedidosBarra}
                  readOnly={true}
                />
              </div>
            )}

            {/* Panel Reservas - Gerente puede interactuar */}
            {activeSection === 'panel-reservas' && <ReservasManagement />}

            {/* Historial */}
            {activeSection === 'historial' && <HistorialPedidos />}

            {/* Inventario */}
            {activeSection === 'inventario' && <ProductosManagement />}

            {/* Configuracion */}
            {activeSection === 'configuracion' && <LocalConfigManager />}
          </main>
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteEmployeeModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      {editingEmpleado && (
        <EditEmployeeModal
          empleado={editingEmpleado}
          onClose={() => setEditingEmpleado(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg text-[#334155] mb-2">¿Eliminar empleado?</h3>
            <p className="text-sm text-[#64748B] mb-6">
              El empleado{' '}
              <strong>
                {empleados.find((e) => e.id === showDeleteConfirm)?.nombre}
              </strong>{' '}
              será eliminado permanentemente.
            </p>
            <div className="flex gap-3">
              <SecondaryButton
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                Cancelar
              </SecondaryButton>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mi Perfil */}
      <MiPerfilEmpleado
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
      />
    </div>
  );
}
