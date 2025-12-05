'use client';

import {
  BarChart3,
  Calendar,
  ChefHat,
  Download,
  Eye,
  Home,
  Package,
  Settings,
  UserPlus,
  Users,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { EditEmployeeModal } from '../../components/gerente/EditEmployeeModal';
import { EmployeeManagement } from '../../components/gerente/EmployeeManagement';
import { InviteEmployeeModal } from '../../components/gerente/InviteEmployeeModal';
import { MetricsDashboard } from '../../components/gerente/MetricsDashboard';
import { ProductosManagement } from '../../components/gerente/ProductosManagement';
import { StatsOverview } from '../../components/gerente/StatsOverview';
import { PedidosManagement } from '../../components/mesero/PedidosManagement';
import { ReservasManagement } from '../../components/mesero/ReservasManagement';
import { TablasMapa } from '../../components/mesero/TablasMapa';
import { Toast, useToast } from '../../components/notifications/Toast';
import {
  MiPerfilEmpleado,
  PanelSidebar,
  PanelTopNav,
} from '../../components/panel';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiClient';
import type { Mesa, Pedido } from '../mesero/DashboardMeseroScreen';

interface Empleado {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: 'activo' | 'inactivo';
  creado_el: string;
}

export default function DashboardGerenteScreen() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [dateRange, setDateRange] = useState<string>('mes');
  const [showProfile, setShowProfile] = useState(false);
  const [activeSection, setActiveSection] = useState<
    | 'dashboard'
    | 'empleados'
    | 'metricas'
    | 'panel-mesero'
    | 'panel-cocina'
    | 'panel-bartender'
    | 'panel-reservas'
    | 'inventario'
    | 'configuracion'
  >('dashboard');
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Cargar mesas y pedidos cuando se navega a paneles
  useEffect(() => {
    const loadPanelData = async () => {
      if (
        activeSection === 'panel-mesero' ||
        activeSection === 'panel-cocina' ||
        activeSection === 'panel-bartender' ||
        activeSection === 'panel-reservas'
      ) {
        try {
          const [mesasData, pedidosData] = await Promise.all([
            api.empresa.getMesas(),
            api.empresa.getPedidos(),
          ]);
          setMesas(
            mesasData.map((m: Record<string, unknown>) => ({
              id: String(m.id),
              id_empresa: String(m.id_local),
              nombre: m.nombre as string,
              capacidad: m.capacidad as number,
              estado: (m.estado as string).toUpperCase(),
            })) as Mesa[]
          );
          setPedidos(
            pedidosData.map((p: Record<string, unknown>) => ({
              id: String(p.id),
              id_mesa: String(p.id_mesa),
              fecha_pedido: p.creado_el as string,
              total: p.total as number,
              estado: ((p.estado as string) || 'INICIADO').toUpperCase(),
              creado_el: p.creado_el as string,
              mesa_nombre: p.mesa_nombre as string,
            })) as Pedido[]
          );
        } catch (error) {
          console.error('Error loading panel data:', error);
        }
      }
    };
    loadPanelData();
  }, [activeSection]);

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
          estado: (e.estado as string) === 'activo' ? 'activo' : 'inactivo',
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
  const stats = useMemo(() => {
    const activos = empleados.filter((e) => e.estado === 'activo').length;
    const inactivos = empleados.filter((e) => e.estado === 'inactivo').length;
    return {
      ventasHoy: 0,
      trendVentas: 0,
      ordenesHoy: 0,
      ordenesEnProceso: 0,
      empleadosTotal: empleados.length,
      empleadosActivos: activos,
      empleadosInactivos: inactivos,
      clientesHoy: 0,
      clientesNuevos: 0,
    };
  }, [empleados]);

  const handleInviteSuccess = () => {
    showToast('success', 'Invitación enviada exitosamente');
    // Refresh empleados list
  };

  const handleEditSuccess = () => {
    showToast('success', 'Empleado actualizado exitosamente');
    // Refresh empleados list
  };

  const handleToggleStatus = async (id: string) => {
    try {
      // Mock API call
      // PATCH /api/empresa/empleados/${id}
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEmpleados((prev) =>
        prev.map((emp) =>
          emp.id === id
            ? {
                ...emp,
                estado: emp.estado === 'activo' ? 'inactivo' : 'activo',
              }
            : emp
        )
      );
      showToast('success', 'Estado actualizado');
    } catch {
      showToast('error', 'Error al actualizar estado');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;

    try {
      // Mock API call
      // DELETE /api/empresa/empleados/${showDeleteConfirm}
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEmpleados((prev) =>
        prev.filter((emp) => emp.id !== showDeleteConfirm)
      );
      showToast('success', 'Empleado eliminado');
      setShowDeleteConfirm(null);
    } catch {
      showToast('error', 'Error al eliminar empleado');
    }
  };

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: Home,
    },
    {
      id: 'empleados' as const,
      label: 'Empleados',
      icon: Users,
    },
    {
      id: 'metricas' as const,
      label: 'Metricas',
      icon: BarChart3,
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
    {
      id: 'panel-reservas' as const,
      label: 'Panel Reservas',
      icon: Calendar,
    },
    {
      id: 'inventario' as const,
      label: 'Inventario',
      icon: Package,
    },
    {
      id: 'configuracion' as const,
      label: 'Configuracion',
      icon: Settings,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      {/* Sidebar */}
      <PanelSidebar
        title="RestoMap"
        subtitle="Panel Gerente"
        icon={Home}
        menuItems={menuItems}
        activeItem={activeSection}
        onNavigate={(id) => setActiveSection(id as typeof activeSection)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <PanelTopNav
          panelName="Panel de Gerente"
          pageTitle={
            activeSection === 'dashboard'
              ? 'Dashboard'
              : activeSection === 'empleados'
              ? 'Empleados'
              : activeSection === 'metricas'
              ? 'Metricas'
              : activeSection === 'panel-mesero'
              ? 'Panel Mesero (Solo Lectura)'
              : activeSection === 'panel-cocina'
              ? 'Panel Cocina (Solo Lectura)'
              : activeSection === 'panel-bartender'
              ? 'Panel Barra (Solo Lectura)'
              : activeSection === 'panel-reservas'
              ? 'Panel Reservas'
              : activeSection === 'inventario'
              ? 'Inventario'
              : 'Configuracion'
          }
          pageDescription="Vista del gerente"
          user={user}
          onOpenProfile={() => setShowProfile(true)}
        />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <>
              <StatsOverview stats={stats} />
              <div className="flex flex-wrap gap-3 mb-8">
                <PrimaryButton onClick={() => setShowInviteModal(true)}>
                  <UserPlus size={16} />
                  Invitar Empleado
                </PrimaryButton>
                <SecondaryButton onClick={() => setActiveSection('metricas')}>
                  <BarChart3 size={16} />
                  Ver Metricas
                </SecondaryButton>
                <SecondaryButton>
                  <Download size={16} />
                  Descargar Reporte
                </SecondaryButton>
              </div>
              <EmployeeManagement
                empleados={empleados}
                onInvite={() => setShowInviteModal(true)}
                onEdit={(empleado) => setEditingEmpleado(empleado)}
                onDelete={(id) => setShowDeleteConfirm(id)}
                onToggleStatus={handleToggleStatus}
              />
              <div className="mt-8">
                <MetricsDashboard
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            </>
          )}

          {/* Empleados Section */}
          {activeSection === 'empleados' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-[#334155]">Gestion de Empleados</h2>
                <PrimaryButton onClick={() => setShowInviteModal(true)}>
                  <UserPlus size={16} />
                  Invitar Empleado
                </PrimaryButton>
              </div>
              <EmployeeManagement
                empleados={empleados}
                onInvite={() => setShowInviteModal(true)}
                onEdit={(empleado) => setEditingEmpleado(empleado)}
                onDelete={(id) => setShowDeleteConfirm(id)}
                onToggleStatus={handleToggleStatus}
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
                  <strong>Modo visualizacion:</strong> Estas viendo el panel del
                  mesero en modo solo lectura.
                </p>
              </div>
              <TablasMapa
                mesas={mesas}
                onMesaUpdate={() => {}}
                onMesaCreate={() => {}}
                onMesaDelete={() => {}}
                readOnly={true}
              />
            </div>
          )}

          {/* Panel Cocina - Solo Visualizacion */}
          {activeSection === 'panel-cocina' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Eye size={20} className="text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Modo visualizacion:</strong> Estas viendo el panel de
                  cocina en modo solo lectura.
                </p>
              </div>
              <PedidosManagement
                pedidos={pedidos}
                mesas={mesas}
                onPedidoUpdate={() => {}}
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
                  <strong>Modo visualizacion:</strong> Estas viendo el panel de
                  barra en modo solo lectura.
                </p>
              </div>
              <PedidosManagement
                pedidos={pedidos}
                mesas={mesas}
                onPedidoUpdate={() => {}}
                readOnly={true}
              />
            </div>
          )}

          {/* Panel Reservas - Gerente puede interactuar */}
          {activeSection === 'panel-reservas' && <ReservasManagement />}

          {/* Inventario */}
          {activeSection === 'inventario' && <ProductosManagement />}

          {/* Configuracion */}
          {activeSection === 'configuracion' && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
              <Settings size={48} className="text-[#94A3B8] mx-auto mb-4" />
              <h3 className="text-[#334155] mb-2">Configuracion</h3>
              <p className="text-sm text-[#64748B]">
                Seccion de configuracion del local (proximamente)
              </p>
            </div>
          )}
        </main>
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

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
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
