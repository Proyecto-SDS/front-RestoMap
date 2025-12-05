'use client';

import { BarChart3, Download, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { EditEmployeeModal } from '../../components/gerente/EditEmployeeModal';
import { EmployeeManagement } from '../../components/gerente/EmployeeManagement';
import { InviteEmployeeModal } from '../../components/gerente/InviteEmployeeModal';
import { MetricsDashboard } from '../../components/gerente/MetricsDashboard';
import { Sidebar } from '../../components/gerente/Sidebar';
import { StatsOverview } from '../../components/gerente/StatsOverview';
import { TopNav } from '../../components/gerente/TopNav';
import { Toast, useToast } from '../../components/notifications/Toast';
import { useAuth } from '../../context/AuthContext';

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
  const router = useRouter();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [stats, setStats] = useState({
    ventasHoy: 0,
    trendVentas: 0,
    ordenesHoy: 0,
    ordenesEnProceso: 0,
    empleadosTotal: 0,
    empleadosActivos: 0,
    empleadosInactivos: 0,
    clientesHoy: 0,
    clientesNuevos: 0,
  });

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [dateRange, setDateRange] = useState<string>('mes');

  const updateStatsFromEmpleados = (emps: Empleado[]) => {
    const activos = emps.filter((e) => e.estado === 'activo').length;
    const inactivos = emps.filter((e) => e.estado === 'inactivo').length;

    setStats((prev) => ({
      ...prev,
      empleadosTotal: emps.length,
      empleadosActivos: activos,
      empleadosInactivos: inactivos,
    }));
  };

  // Load empleados
  useEffect(() => {
    // Mock data - replace with API call
    const mockEmpleados: Empleado[] = [
      {
        id: '1',
        nombre: 'Juan Pérez',
        correo: 'juan@ejemplo.com',
        telefono: '+56912345678',
        rol: 'admin',
        estado: 'activo',
        creado_el: '2024-01-15',
      },
      {
        id: '2',
        nombre: 'María García',
        correo: 'maria@ejemplo.com',
        telefono: '+56923456789',
        rol: 'mesero',
        estado: 'activo',
        creado_el: '2024-02-10',
      },
      {
        id: '3',
        nombre: 'Carlos López',
        correo: 'carlos@ejemplo.com',
        telefono: '+56934567890',
        rol: 'cocinero',
        estado: 'activo',
        creado_el: '2024-02-20',
      },
      {
        id: '4',
        nombre: 'Ana Martínez',
        correo: 'ana@ejemplo.com',
        telefono: '+56945678901',
        rol: 'bartender',
        estado: 'activo',
        creado_el: '2024-03-05',
      },
      {
        id: '5',
        nombre: 'Pedro Sánchez',
        correo: 'pedro@ejemplo.com',
        rol: 'reservas',
        estado: 'inactivo',
        creado_el: '2024-01-20',
      },
    ];

    // eslint-disable-next-line
    setEmpleados(mockEmpleados);
    updateStatsFromEmpleados(mockEmpleados);
  }, []);

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

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <Sidebar activeItem="dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <TopNav />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats Overview */}
          <StatsOverview stats={stats} />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <PrimaryButton onClick={() => setShowInviteModal(true)}>
              <UserPlus size={16} />
              Invitar Empleado
            </PrimaryButton>
            <SecondaryButton
              onClick={() => router.push('/dashboard-gerente/metricas')}
            >
              <BarChart3 size={16} />
              Ver Métricas
            </SecondaryButton>
            <SecondaryButton>
              <Download size={16} />
              Descargar Reporte
            </SecondaryButton>
          </div>

          {/* Employee Management */}
          <EmployeeManagement
            empleados={empleados}
            onInvite={() => setShowInviteModal(true)}
            onEdit={(empleado) => setEditingEmpleado(empleado)}
            onDelete={(id) => setShowDeleteConfirm(id)}
            onToggleStatus={handleToggleStatus}
          />

          {/* Metrics Dashboard */}
          <div className="mt-8">
            <MetricsDashboard
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
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
    </div>
  );
}
