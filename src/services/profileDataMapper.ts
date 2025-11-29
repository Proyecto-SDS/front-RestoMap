import { FavoriteData } from '../components/profile/FavoriteCard';
import { OpinionData } from '../components/profile/OpinionCard';
import { ReservationData } from '../components/profile/ReservationCard';
import { api } from '../utils/apiClient';

export const mapReservations = async (
  reservasRes: any
): Promise<ReservationData[]> => {
  const reservas = reservasRes.reservas || [];
  const mappedReservations: ReservationData[] = [];

  for (const r of reservas) {
    let imagen = '';
    let direccion = '';

    // Intentar obtener imagen del establecimiento
    if (r.localId) {
      try {
        const local = await api.getEstablishment(r.localId);
        imagen = local.imagenes?.[0] || '';
        direccion = local.direccion?.direccion_completa || '';
      } catch (err) {
        console.error(`Error loading establishment ${r.localId}:`, err);
      }
    }

    mappedReservations.push({
      id: r.id.toString(),
      establishment: {
        id: r.localId || '',
        name: r.localNombre || '',
        type: 'Restaurante' as any,
        image: imagen,
        address: direccion,
      },
      fecha_reserva: r.fecha,
      hora_reserva: r.hora,
      mesa: {
        nombre: r.mesas?.[0] || 'Mesa',
        capacidad: 4,
      },
      numero_personas: 2,
      estado:
        r.estado === 'confirmada'
          ? 'confirmed'
          : r.estado === 'rechazada'
          ? 'cancelled'
          : 'pending',
      notas: '',
      codigo_confirmacion: '',
    });
  }

  return mappedReservations;
};

export const mapOpinions = async (
  opinionesRes: any
): Promise<OpinionData[]> => {
  const opiniones = opinionesRes.opiniones || [];
  const mappedOpinions: OpinionData[] = [];

  for (const o of opiniones) {
    let imagen = '';

    // Intentar obtener imagen del establecimiento
    if (o.localId) {
      try {
        const local = await api.getEstablishment(o.localId);
        imagen = local.imagenes?.[0] || '';
      } catch (err) {
        console.error(`Error loading establishment ${o.localId}:`, err);
      }
    }

    mappedOpinions.push({
      id: o.id.toString(),
      establishment: {
        id: o.localId || '',
        name: o.localNombre || '',
        type: 'Restaurante' as any,
        image: imagen,
      },
      puntuacion: o.puntuacion || 0,
      comentario: o.comentario || '',
      creado_el: o.fecha || new Date().toISOString(),
    });
  }

  return mappedOpinions;
};

export const mapFavorites = async (
  favoritosRes: any
): Promise<FavoriteData[]> => {
  const favoritoIds = (favoritosRes.favoritos || []).map((f: any) => f.localId);
  const favoritesWithDetails: FavoriteData[] = [];

  for (const localId of favoritoIds) {
    try {
      const local = await api.getEstablishment(localId);
      favoritesWithDetails.push({
        id: local.id,
        establishment: {
          id: local.id,
          name: local.nombre || '',
          type: local.tipo || 'Restaurante',
          image: local.imagenes?.[0] || '',
          address: local.direccion?.direccion_completa || '',
          rating: local.rating || 0,
          reviewCount: local.numero_opiniones || 0,
          status: 'open' as 'open' | 'closed',
        },
        creado_el: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Error loading establishment ${localId}:`, err);
    }
  }

  return favoritesWithDetails;
};
