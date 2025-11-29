'use client';

import { ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Toast, useToast } from '../../components/notifications/Toast';
import { ConfirmDialog } from '../../components/profile/ConfirmDialog';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { FavoriteData } from '../../components/profile/FavoriteCard';
import { FavoritosSection } from '../../components/profile/FavoritosSection';
import { OpinionData } from '../../components/profile/OpinionCard';
import { OpinionesSection } from '../../components/profile/OpinionesSection';
import { ProfileHeaderCard } from '../../components/profile/ProfileHeaderCard';
import { ReservasSection } from '../../components/profile/ReservasSection';
import { ReservationData } from '../../components/profile/ReservationCard';
import { ReservationDetailModal } from '../../components/profile/ReservationDetailModal';
import { StatsCards } from '../../components/profile/StatsCards';
import { TabNavigation } from '../../components/profile/TabNavigation';
import { useAuth } from '../../context/AuthContext';
import { useFilteredReservations } from '../../hooks/useFilteredReservations';
import { useProfileData } from '../../hooks/useProfileData';
import { useSortedData } from '../../hooks/useSortedData';
import { api } from '../../utils/apiClient';
import { calculateTotalPages, paginateItems } from '../../utils/pagination';
import { SortFunctions } from '../../utils/sorting';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<
    'reservas' | 'opiniones' | 'favoritos'
  >('reservas');

  // Load data using custom hook
  const {
    reservations,
    opinions,
    favorites,
    isLoading,
    setReservations,
    setFavorites,
  } = useProfileData(user?.id, (error) => showToast('error', error));

  // Pagination state
  const [reservationPage, setReservationPage] = useState(1);
  const [opinionPage, setOpinionPage] = useState(1);
  const [favoritePage, setFavoritePage] = useState(1);

  const reservationsPerPage = 9;
  const opinionsPerPage = 5;
  const favoritesPerPage = 12;

  // Filter/sort state
  const [reservationFilter, setReservationFilter] = useState('todas');
  const [reservationSort, setReservationSort] = useState('recientes');
  const [opinionSort, setOpinionSort] = useState('recientes');
  const [favoriteSort, setFavoriteSort] = useState('recientes');

  // Modal state
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationData | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'cancel_reservation' | 'remove_favorite' | null;
    itemId: string | null;
  }>({ isOpen: false, type: null, itemId: null });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Filter and sort reservations using custom hook
  const filteredReservations = useFilteredReservations(
    reservations,
    reservationFilter,
    reservationSort
  );

  // Sort opinions using custom hook
  const opinionSortFunctions: SortFunctions<OpinionData> = useMemo(
    () => ({
      recientes: (a, b) =>
        new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime(),
      mejor: (a, b) => b.puntuacion - a.puntuacion,
      peor: (a, b) => a.puntuacion - b.puntuacion,
    }),
    []
  );

  const sortedOpinions = useSortedData(
    opinions,
    opinionSort,
    opinionSortFunctions
  );

  // Sort favorites using custom hook
  const favoriteSortFunctions: SortFunctions<FavoriteData> = useMemo(
    () => ({
      recientes: (a, b) =>
        new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime(),
      nombre_az: (a, b) =>
        a.establishment.name.localeCompare(b.establishment.name),
      nombre_za: (a, b) =>
        b.establishment.name.localeCompare(a.establishment.name),
      rating: (a, b) => b.establishment.rating - a.establishment.rating,
    }),
    []
  );

  const sortedFavorites = useSortedData(
    favorites,
    favoriteSort,
    favoriteSortFunctions
  );

  // Paginate data
  const paginatedReservations = paginateItems(
    filteredReservations,
    reservationPage,
    reservationsPerPage
  );

  const paginatedOpinions = paginateItems(
    sortedOpinions,
    opinionPage,
    opinionsPerPage
  );

  const paginatedFavorites = paginateItems(
    sortedFavorites,
    favoritePage,
    favoritesPerPage
  );

  // Calculate stats
  const stats = useMemo(
    () => ({
      activeReservations: reservations.filter((r) => {
        const resDate = new Date(`${r.fecha_reserva}T${r.hora_reserva}`);
        return resDate >= new Date() && r.estado !== 'cancelled';
      }).length,
      totalOpinions: opinions.length,
      totalFavorites: favorites.length,
    }),
    [reservations, opinions, favorites]
  );

  // Handlers
  const handleBack = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
    showToast('success', 'Sesión cerrada correctamente');
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  const handleUpdateProfile = async (nombre: string, telefono: string) => {
    const result = await updateProfile(nombre, telefono);

    if (result.success) {
      showToast('success', 'Perfil actualizado correctamente');
      setIsEditProfileModalOpen(false);
    } else {
      showToast('error', result.error || 'Error al actualizar perfil');
    }

    return result;
  };

  const handleCancelReservation = (id: string) => {
    setConfirmDialog({ isOpen: true, type: 'cancel_reservation', itemId: id });
  };

  const handleRemoveFavorite = (id: string) => {
    setConfirmDialog({ isOpen: true, type: 'remove_favorite', itemId: id });
  };

  const handleConfirmAction = () => {
    const { type, itemId } = confirmDialog;

    if (!itemId) return;

    if (type === 'cancel_reservation') {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === itemId ? { ...r, estado: 'cancelled' as const } : r
        )
      );
      showToast('success', 'Reserva cancelada correctamente');
      setSelectedReservation(null);
    } else if (type === 'remove_favorite') {
      const favorite = favorites.find((f) => f.id === itemId);
      if (favorite) {
        api
          .removeFavorite(favorite.establishment.id)
          .then(() => {
            setFavorites((prev) => prev.filter((f) => f.id !== itemId));
            showToast('success', 'Eliminado de favoritos');
          })
          .catch((error) => {
            console.error('Error removing favorite:', error);
            showToast('error', 'Error al eliminar favorito');
          });
      }
    }

    setConfirmDialog({ isOpen: false, type: null, itemId: null });
  };

  const handleCopyConfirmation = () => {
    if (selectedReservation) {
      navigator.clipboard.writeText(selectedReservation.codigo_confirmacion);
      showToast('success', 'Código copiado al portapapeles');
    }
  };

  if (!user) {
    return null;
  }

  const getConfirmDialogProps = () => {
    const { type } = confirmDialog;

    if (type === 'cancel_reservation') {
      return {
        title: '¿Cancelar esta reserva?',
        message:
          'No podrás recuperarla. Puedes reservar nuevamente si lo deseas.',
        warning: 'Nota: Algunas políticas de cancelación pueden aplicar',
        confirmText: 'Sí, cancelar reserva',
        cancelText: 'No, mantener reserva',
        isDestructive: true,
      };
    }

    if (type === 'remove_favorite') {
      return {
        title: '¿Quitar de favoritos?',
        message:
          '¿Estás seguro que deseas quitar este establecimiento de tus favoritos?',
        confirmText: 'Sí, quitar',
        cancelText: 'Cancelar',
        isDestructive: false,
      };
    }

    return {
      title: '',
      message: '',
      confirmText: '',
      cancelText: '',
      isDestructive: false,
    };
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft size={24} className="text-[#334155]" />
            </button>
            <h1 className="text-[#334155]">Mi Perfil</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeaderCard
          user={user}
          onEditClick={() => setIsEditProfileModalOpen(true)}
        />

        <StatsCards
          stats={stats}
          onCardClick={(section) => setActiveTab(section)}
        />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="bg-white rounded-b-2xl shadow-sm p-6">
          {activeTab === 'reservas' && (
            <ReservasSection
              reservations={paginatedReservations}
              currentPage={reservationPage}
              totalPages={calculateTotalPages(
                filteredReservations.length,
                reservationsPerPage
              )}
              totalItems={filteredReservations.length}
              itemsPerPage={reservationsPerPage}
              filter={reservationFilter}
              sort={reservationSort}
              onPageChange={(page) => {
                setReservationPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onFilterChange={setReservationFilter}
              onSortChange={setReservationSort}
              onViewDetails={setSelectedReservation}
              onCancel={handleCancelReservation}
            />
          )}

          {activeTab === 'opiniones' && (
            <OpinionesSection
              opinions={paginatedOpinions}
              currentPage={opinionPage}
              totalPages={calculateTotalPages(
                sortedOpinions.length,
                opinionsPerPage
              )}
              totalItems={sortedOpinions.length}
              itemsPerPage={opinionsPerPage}
              sort={opinionSort}
              onPageChange={(page) => {
                setOpinionPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSortChange={setOpinionSort}
              onViewEstablishment={(id) =>
                router.push(`/establecimientos/${id}`)
              }
            />
          )}

          {activeTab === 'favoritos' && (
            <FavoritosSection
              favorites={paginatedFavorites}
              currentPage={favoritePage}
              totalPages={calculateTotalPages(
                sortedFavorites.length,
                favoritesPerPage
              )}
              totalItems={sortedFavorites.length}
              itemsPerPage={favoritesPerPage}
              sort={favoriteSort}
              onPageChange={(page) => {
                setFavoritePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSortChange={setFavoriteSort}
              onVisit={(id) => router.push(`/establecimientos/${id}`)}
              onRemove={handleRemoveFavorite}
            />
          )}
        </div>
      </div>

      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onCancel={handleCancelReservation}
          onViewEstablishment={(id) => router.push(`/establecimientos/${id}`)}
          onCopyConfirmation={handleCopyConfirmation}
        />
      )}

      {confirmDialog.isOpen && (
        <ConfirmDialog
          {...getConfirmDialogProps()}
          onConfirm={handleConfirmAction}
          onCancel={() =>
            setConfirmDialog({ isOpen: false, type: null, itemId: null })
          }
        />
      )}

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />

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
