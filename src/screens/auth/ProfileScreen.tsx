'use client';

import { ArrowLeft, Edit2, LogOut, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { TextInput } from '../../components/inputs/TextInput';
import { Modal } from '../../components/modals/Modal';
import { Toast, useToast } from '../../components/notifications/Toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/apiClient';
import { formatDate } from '../../utils/formatters';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: user?.name || '',
    telefono: user?.phone || '',
  });

  // Estados para datos reales
  const [reservations, setReservations] = useState<any[]>([]);
  const [opinions, setOpinions] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setIsLoadingData(true);
    try {
      const [reservasResponse, opinionesResponse] = await Promise.all([
        api.getMyReservations(),
        api.getMyOpinions(),
      ]);

      setReservations(reservasResponse.reservas || []);
      setOpinions(opinionesResponse.opiniones || []);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      showToast('error', 'Error al cargar tus datos');
    } finally {
      setIsLoadingData(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748B] mb-4">No has iniciado sesión</p>
          <PrimaryButton onClick={() => router.push('/login')}>
            Iniciar sesión
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    showToast('success', 'Sesión cerrada correctamente');
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    const result = await updateProfile(editForm.nombre, editForm.telefono);
    setIsLoading(false);

    if (result.success) {
      showToast('success', 'Perfil actualizado correctamente');
      setIsEditModalOpen(false);
    } else {
      showToast('error', result.error || 'Error al actualizar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={24} className="text-[#334155]" />
          </button>
          <h1 className="text-[#334155]">Mi perfil</h1>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-linear-to-r from-[#F97316] to-[#EF4444] flex items-center justify-center text-white text-3xl shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-[#334155] mb-2">{user.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#64748B] justify-center sm:justify-start">
                  <Mail size={16} />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-[#64748B] justify-center sm:justify-start">
                    <Phone size={16} />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <PrimaryButton
                size="md"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Edit2 size={18} />
                Editar perfil
              </PrimaryButton>
              <SecondaryButton
                size="md"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                <LogOut size={18} />
                Cerrar sesión
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-[#334155] mb-4">Mis reservas</h3>
          {isLoadingData ? (
            <p className="text-[#64748B] text-center py-8">
              Cargando reservas...
            </p>
          ) : reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#F97316] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#334155]">
                      {reservation.localNombre}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        reservation.estado === 'confirmada'
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : reservation.estado === 'pendiente'
                          ? 'bg-[#F97316]/10 text-[#F97316]'
                          : 'bg-[#94A3B8]/10 text-[#94A3B8]'
                      }`}
                    >
                      {reservation.estado}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#64748B]">
                    <div>
                      <span className="">Fecha:</span>{' '}
                      {reservation.fecha
                        ? formatDate(reservation.fecha, 'short')
                        : 'N/A'}
                    </div>
                    <div>
                      <span className="">Hora:</span>{' '}
                      {reservation.hora || 'N/A'}
                    </div>
                    <div>
                      <span className="">Mesas:</span>{' '}
                      {reservation.mesas?.join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#64748B] text-center py-8">
              No tienes reservas
            </p>
          )}
        </div>

        {/* Recent Opinions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-[#334155] mb-4">Mis opiniones</h3>
          {isLoadingData ? (
            <p className="text-[#64748B] text-center py-8">
              Cargando opiniones...
            </p>
          ) : opinions.length > 0 ? (
            <div className="space-y-4">
              {opinions.map((opinion) => (
                <div
                  key={opinion.id}
                  className="border border-[#E2E8F0] rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#334155]">{opinion.localNombre}</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= opinion.puntuacion
                              ? 'text-[#F97316]'
                              : 'text-[#E2E8F0]'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] mb-2">
                    {opinion.comentario}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {opinion.fecha
                      ? formatDate(opinion.fecha, 'long')
                      : 'Fecha no disponible'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#64748B] text-center py-8">
              No has escrito opiniones aún
            </p>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar perfil"
        size="md"
      >
        <div className="space-y-4">
          <TextInput
            label="Nombre completo"
            value={editForm.nombre}
            onChange={(e) =>
              setEditForm({ ...editForm, nombre: e.target.value })
            }
            placeholder="Tu nombre"
          />
          <TextInput
            label="Teléfono"
            value={editForm.telefono}
            onChange={(e) =>
              setEditForm({ ...editForm, telefono: e.target.value })
            }
            placeholder="+56912345678"
          />
          <div className="bg-[#F1F5F9] rounded-lg p-3">
            <p className="text-sm text-[#64748B]">
              <strong>Correo:</strong> {user.email}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              El correo no puede ser modificado por seguridad
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <PrimaryButton
              className="flex-1"
              onClick={handleUpdateProfile}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Guardar cambios
            </PrimaryButton>
            <SecondaryButton
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </SecondaryButton>
          </div>
        </div>
      </Modal>

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
