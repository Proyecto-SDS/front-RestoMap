import { useCallback, useEffect, useState } from 'react';
import { FavoriteData } from '../components/profile/FavoriteCard';
import { OpinionData } from '../components/profile/OpinionCard';
import { ReservationData } from '../components/profile/ReservationCard';
import {
    mapFavorites,
    mapOpinions,
    mapReservations,
} from '../services/profileDataMapper';
import { api } from '../utils/apiClient';

export interface UseProfileDataResult {
  reservations: ReservationData[];
  opinions: OpinionData[];
  favorites: FavoriteData[];
  isLoading: boolean;
  reload: () => Promise<void>;
  setReservations: React.Dispatch<React.SetStateAction<ReservationData[]>>;
  setFavorites: React.Dispatch<React.SetStateAction<FavoriteData[]>>;
}

export function useProfileData(
  userId: string | null | undefined,
  onError?: (message: string) => void
): UseProfileDataResult {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [opinions, setOpinions] = useState<OpinionData[]>([]);
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const [reservasRes, opinionesRes, favoritosRes] = await Promise.all([
        api.getMyReservations(),
        api.getMyOpinions(),
        api.getFavorites(),
      ]);

      const mappedReservations = await mapReservations(reservasRes);
      const mappedOpinions = await mapOpinions(opinionesRes);
      const mappedFavorites = await mapFavorites(favoritosRes);

      setReservations(mappedReservations);
      setOpinions(mappedOpinions);
      setFavorites(mappedFavorites);
    } catch (error: unknown) {
      console.error('Error loading user data:', error);
      if (onError) {
        onError('Error al cargar datos');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, onError]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    reservations,
    opinions,
    favorites,
    isLoading,
    reload: loadUserData,
    setReservations,
    setFavorites,
  };
}
