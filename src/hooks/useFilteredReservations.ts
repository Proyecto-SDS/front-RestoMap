import { useMemo } from 'react';
import { ReservationData } from '../components/profile/ReservationCard';

export type ReservationFilterType =
  | 'todas'
  | 'proximas'
  | 'pasadas'
  | 'canceladas';
export type ReservationSortType = 'recientes' | 'fecha';

export function useFilteredReservations(
  reservations: ReservationData[],
  filter: string,
  sort: string
): ReservationData[] {
  return useMemo(() => {
    let filtered = [...reservations];

    // Apply filter
    if (filter === 'proximas') {
      const now = new Date();
      filtered = filtered.filter((r) => {
        const resDate = new Date(`${r.fecha_reserva}T${r.hora_reserva}`);
        return resDate >= now && r.estado !== 'cancelled';
      });
    } else if (filter === 'pasadas') {
      const now = new Date();
      filtered = filtered.filter((r) => {
        const resDate = new Date(`${r.fecha_reserva}T${r.hora_reserva}`);
        return resDate < now;
      });
    } else if (filter === 'canceladas') {
      filtered = filtered.filter((r) => r.estado === 'cancelled');
    }

    // Apply sort
    if (sort === 'recientes') {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sort === 'fecha') {
      filtered.sort((a, b) => {
        const dateA = new Date(`${a.fecha_reserva}T${a.hora_reserva}`);
        const dateB = new Date(`${b.fecha_reserva}T${b.hora_reserva}`);
        return dateA.getTime() - dateB.getTime();
      });
    }

    return filtered;
  }, [reservations, filter, sort]);
}
