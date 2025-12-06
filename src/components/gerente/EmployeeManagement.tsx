import { Filter, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { InvitationsList } from './InvitationsList';

interface Empleado {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: 'activo' | 'inactivo';
  creado_el: string;
}

interface EmployeeManagementProps {
  empleados: Empleado[];
  onInvite: () => void;
  onEdit: (empleado: Empleado) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function EmployeeManagement({
  empleados,
  onInvite,
  onEdit,
  onDelete,
  onToggleStatus,
}: EmployeeManagementProps) {
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'empleados' | 'invitaciones'>(
    'empleados'
  );
  const itemsPerPage = 10;

  const roles = [
    'todos',
    'admin',
    'mesero',
    'cocinero',
    'bartender',
    'reservas',
  ];

  const filteredEmpleados = empleados.filter(
    (emp) => filterRole === 'todos' || emp.rol === filterRole
  );

  const totalPages = Math.ceil(filteredEmpleados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmpleados = filteredEmpleados.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getRoleBadgeColor = (rol: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      mesero: 'bg-blue-100 text-blue-700',
      cocinero: 'bg-orange-100 text-orange-700',
      bartender: 'bg-green-100 text-green-700',
      reservas: 'bg-pink-100 text-pink-700',
    };
    return colors[rol] || 'bg-gray-100 text-gray-700';
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('empleados')}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'empleados'
                ? 'text-[#F97316] border-[#F97316]'
                : 'text-[#64748B] border-transparent hover:text-[#334155]'
            }`}
          >
            Empleados Activos
          </button>
          <button
            onClick={() => setActiveTab('invitaciones')}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'invitaciones'
                ? 'text-[#F97316] border-[#F97316]'
                : 'text-[#64748B] border-transparent hover:text-[#334155]'
            }`}
          >
            Invitaciones
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'invitaciones' ? (
        <InvitationsList />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl text-[#334155] mb-1">
                Gestión de Empleados
              </h2>
              <p className="text-sm text-[#94A3B8]">
                {filteredEmpleados.length} empleado
                {filteredEmpleados.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Role filter */}
              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
              </div>

              <PrimaryButton onClick={onInvite} size="sm">
                + Invitar Nuevo Empleado
              </PrimaryButton>
            </div>
          </div>

          {/* Table */}
          {paginatedEmpleados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#94A3B8]">No hay empleados</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left py-3 px-4 text-sm text-[#64748B] bg-[#F1F5F9]">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-[#64748B] bg-[#F1F5F9]">
                        Correo
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-[#64748B] bg-[#F1F5F9]">
                        Rol
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-[#64748B] bg-[#F1F5F9]">
                        Estado
                      </th>
                      <th className="text-right py-3 px-4 text-sm text-[#64748B] bg-[#F1F5F9]">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmpleados.map((empleado) => (
                      <tr
                        key={empleado.id}
                        className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-[#F97316] to-[#EF4444] rounded-full flex items-center justify-center shrink-0">
                              <span className="text-white text-sm">
                                {getInitials(empleado.nombre)}
                              </span>
                            </div>
                            <span className="text-sm text-[#334155]">
                              {empleado.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-[#64748B]">
                            {empleado.correo}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs ${getRoleBadgeColor(
                              empleado.rol
                            )}`}
                          >
                            {empleado.rol.charAt(0).toUpperCase() +
                              empleado.rol.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                              empleado.estado === 'activo'
                                ? 'bg-green-100 text-[#22C55E]'
                                : 'bg-gray-100 text-[#94A3B8]'
                            }`}
                          >
                            {empleado.estado === 'activo' ? (
                              <UserCheck size={12} />
                            ) : (
                              <UserX size={12} />
                            )}
                            {empleado.estado === 'activo'
                              ? 'Activo'
                              : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(empleado)}
                              className="p-2 text-[#64748B] hover:text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => onToggleStatus(empleado.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                empleado.estado === 'activo'
                                  ? 'text-[#64748B] hover:text-orange-600 hover:bg-orange-50'
                                  : 'text-[#64748B] hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={
                                empleado.estado === 'activo'
                                  ? 'Desactivar'
                                  : 'Activar'
                              }
                            >
                              {empleado.estado === 'activo' ? (
                                <UserX size={16} />
                              ) : (
                                <UserCheck size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => onDelete(empleado.id)}
                              className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-[#E2E8F0]">
                  <p className="text-sm text-[#94A3B8]">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <SecondaryButton
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      size="sm"
                    >
                      Anterior
                    </SecondaryButton>
                    <SecondaryButton
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      size="sm"
                    >
                      Siguiente
                    </SecondaryButton>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
