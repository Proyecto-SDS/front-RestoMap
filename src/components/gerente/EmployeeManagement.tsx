import { Filter, Pencil, Search, Trash2 } from 'lucide-react';
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
  creado_el: string;
}

interface EmployeeManagementProps {
  empleados: Empleado[];
  onInvite: () => void;
  onEdit: (empleado: Empleado) => void;
  onDelete: (id: string) => void;
}

export function EmployeeManagement({
  empleados,
  onInvite,
  onEdit,
  onDelete,
}: EmployeeManagementProps) {
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'empleados' | 'invitaciones'>(
    'empleados'
  );
  const itemsPerPage = 10;

  const roles = ['todos', 'mesero', 'cocinero', 'bartender'];

  const filteredEmpleados = empleados.filter((emp) => {
    // Excluir roles de gerente y admin
    if (emp.rol === 'gerente' || emp.rol === 'admin') return false;

    const matchesRole = filterRole === 'todos' || emp.rol === filterRole;
    const matchesSearch =
      emp.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.correo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

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
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] mb-4 sm:mb-6">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('empleados')}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'empleados'
                ? 'text-[#F97316] border-[#F97316]'
                : 'text-[#64748B] border-transparent hover:text-[#334155]'
            }`}
          >
            Empleados Activos
          </button>
          <button
            onClick={() => setActiveTab('invitaciones')}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
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
          {/* Header - Filtros */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-[#94A3B8]">
                {filteredEmpleados.length} empleado
                {filteredEmpleados.length !== 1 ? 's' : ''} registrados
              </p>
              <PrimaryButton
                onClick={onInvite}
                size="sm"
                className="w-full sm:w-auto"
              >
                + Invitar Empleado
              </PrimaryButton>
            </div>

            {/* Filtros y buscador */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Buscador */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar empleado..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
              </div>

              {/* Role filter */}
              <div className="relative shrink-0">
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto appearance-none pl-10 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
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
            </div>
          </div>

          {/* Lista de empleados */}
          {paginatedEmpleados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#94A3B8]">No hay empleados</p>
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="sm:hidden space-y-3">
                {paginatedEmpleados.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EF4444] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-medium">
                            {getInitials(empleado.nombre)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#334155] truncate">
                            {empleado.nombre}
                          </p>
                          <p className="text-xs text-[#64748B] truncate">
                            {empleado.correo}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(
                          empleado.rol
                        )}`}
                      >
                        {empleado.rol.charAt(0).toUpperCase() +
                          empleado.rol.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => onEdit(empleado)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#64748B] hover:text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(empleado.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="hidden sm:block overflow-x-auto">
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
                            <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EF4444] rounded-full flex items-center justify-center shrink-0">
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(empleado)}
                              className="p-2 text-[#64748B] hover:text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil size={16} />
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
                  <p className="text-sm text-[#94A3B8]">
                    Pagina {currentPage} de {totalPages}
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
