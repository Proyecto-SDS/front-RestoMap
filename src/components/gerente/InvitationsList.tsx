import { Clock, Mail, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../utils/apiClient';

interface Invitation {
  id: number;
  correo: string;
  rol: string;
  estado: string;
  creado_el: string;
  expira_el: string;
  invitado_por: string;
}

export function InvitationsList() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'pendiente' | 'aceptada' | 'rechazada'
  >('all');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await api.empresa.getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvitation = async (id: number) => {
    if (!confirm('¿Estás seguro de cancelar esta invitación?')) return;

    try {
      await api.empresa.cancelInvitation(id);
      await loadInvitations();
    } catch {
      alert('Error al cancelar la invitación');
    }
  };

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === 'all') return true;
    return inv.estado === filter;
  });

  const getStatusBadge = (estado: string) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      aceptada: 'bg-green-100 text-green-700',
      rechazada: 'bg-red-100 text-red-700',
      expirada: 'bg-gray-100 text-gray-700',
    };

    const labels = {
      pendiente: 'Pendiente',
      aceptada: 'Aceptada',
      rechazada: 'Rechazada',
      expirada: 'Expirada',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {labels[estado as keyof typeof labels] || estado}
      </span>
    );
  };

  const getRolLabel = (rol: string) => {
    const roles: Record<string, string> = {
      mesero: 'Mesero',
      cocinero: 'Cocinero',
      bartender: 'Bartender',
      gerente: 'Gerente',
    };
    return roles[rol] || rol;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#334155]">
          Invitaciones Enviadas
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pendiente'
                ? 'bg-[#F97316] text-white'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Invitations list */}
      {filteredInvitations.length === 0 ? (
        <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
          <UserPlus size={48} className="mx-auto text-[#94A3B8] mb-3" />
          <p className="text-[#64748B]">
            {filter === 'all'
              ? 'No hay invitaciones enviadas'
              : `No hay invitaciones ${
                  filter === 'pendiente' ? 'pendientes' : filter
                }`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={20} className="text-[#64748B]" />
                    <div>
                      <p className="font-medium text-[#334155]">
                        {invitation.correo}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {getRolLabel(invitation.rol)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#64748B] mt-3">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Enviada: {formatDate(invitation.creado_el)}</span>
                    </div>
                    {invitation.estado === 'pendiente' && (
                      <div className="flex items-center gap-1">
                        <span>Expira: {formatDate(invitation.expira_el)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(invitation.estado)}
                  {invitation.estado === 'pendiente' && (
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Cancelar invitación"
                    >
                      <Trash2
                        size={18}
                        className="text-[#94A3B8] group-hover:text-red-600"
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
