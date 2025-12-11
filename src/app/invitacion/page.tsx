'use client';

import { Check, Mail, MapPin, UserCheck, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react'; // <--- 1. Importamos Suspense
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiClient';

interface InvitationDetails {
  correo: string;
  rol: string;
  local: {
    id: number;
    nombre: string;
  };
  invitado_por: string;
  expira_el: string;
}

// 2. Renombramos tu componente principal a "InvitationContent"
function InvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, isLoggedIn } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadInvitation = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await api.invitaciones.getInvitationDetails(token);
      setInvitation(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar la invitación';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError('Token de invitación no válido');
      setIsLoading(false);
      return;
    }

    loadInvitation();
  }, [token, loadInvitation]);

  const handleAccept = async () => {
    if (!token) return;

    // Verificar si el usuario está autenticado
    if (!isLoggedIn) {
      // Guardar el token en sessionStorage y redirigir al login
      sessionStorage.setItem('pending_invitation_token', token);
      router.push('/login?redirect=accept-invitation');
      return;
    }

    // Verificar que el correo coincida
    if (user?.email !== invitation?.correo) {
      setError(
        `Debes iniciar sesión con la cuenta ${invitation?.correo} para aceptar esta invitación`
      );
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await api.invitaciones.acceptInvitation(token);
      setSuccess(true);

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard-gerente');
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al aceptar la invitación';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;

    if (!isLoggedIn) {
      alert('Debes iniciar sesión para rechazar la invitación');
      return;
    }

    if (!confirm('¿Estás seguro de rechazar esta invitación?')) return;

    setIsProcessing(true);
    setError('');

    try {
      await api.invitaciones.rejectInvitation(token);
      alert('Invitación rechazada');
      router.push('/');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al rechazar la invitación';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#334155] mb-2">
            ¡Invitación Aceptada!
          </h1>
          <p className="text-[#64748B] mb-6">
            Ahora eres parte del equipo de{' '}
            <strong>{invitation?.local.nombre}</strong>
          </p>
          <p className="text-sm text-[#94A3B8]">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#334155] mb-2">
            Invitación No Válida
          </h1>
          <p className="text-[#64748B] mb-6">{error || 'Error desconocido'}</p>
          <SecondaryButton onClick={() => router.push('/')}>
            Volver al Inicio
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Mail size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Invitación de Empleado</h1>
              <p className="text-orange-100 text-sm">
                Has sido invitado a unirte al equipo
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Local Info */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Local</p>
                <p className="text-lg font-semibold text-[#334155]">
                  {invitation.local.nombre}
                </p>
              </div>
            </div>
          </div>

          {/* Role Info */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <UserCheck size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Rol asignado</p>
                <p className="text-lg font-semibold text-[#334155]">
                  {getRolLabel(invitation.rol)}
                </p>
              </div>
            </div>
          </div>

          {/* Email Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-[#64748B] mb-1">Invitación enviada a</p>
            <p className="font-medium text-[#334155]">{invitation.correo}</p>
          </div>

          {/* Auth check */}
          {!isLoggedIn && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                Debes iniciar sesión con la cuenta{' '}
                <strong>{invitation.correo}</strong> para aceptar esta
                invitación. Si no tienes cuenta, regístrate primero.
              </p>
            </div>
          )}

          {isLoggedIn && user?.email !== invitation.correo && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                Estás conectado como <strong>{user?.email}</strong>. Debes
                iniciar sesión con <strong>{invitation.correo}</strong> para
                aceptar esta invitación.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <SecondaryButton
              onClick={handleReject}
              className="flex-1"
              disabled={isProcessing}
            >
              Rechazar
            </SecondaryButton>
            <PrimaryButton
              onClick={handleAccept}
              className="flex-1"
              isLoading={isProcessing}
              disabled={isProcessing}
            >
              {!isLoggedIn
                ? 'Ir a Iniciar Sesión'
                : isProcessing
                ? 'Procesando...'
                : 'Aceptar Invitación'}
            </PrimaryButton>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#94A3B8]">
              Invitado por: {invitation.invitado_por || 'Gerente del local'}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Expira el:{' '}
              {new Date(invitation.expira_el).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Nuevo componente Default (Wrapper de Suspense)
export default function AcceptInvitationPage() {
  return (
    // Usamos el mismo diseño de loading que tienes arriba como fallback
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}