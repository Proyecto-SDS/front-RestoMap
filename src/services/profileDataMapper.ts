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
    // Usar datos proporcionados por el backend
    const imagen = r.localImagen || '';
    const direccion = r.localDireccion || '';
    const tipo = r.localTipo || 'Restaurante';

    mappedReservations.push({
      id: r.id.toString(),
      establishment: {
        id: r.localId || '',
        name: r.localNombre || '',
        type: tipo as any,
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
      codigo_confirmacion: r.codigoQR || r.id.toString(),
      qrImage: r.qrImage || null,
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
        imagen = local.images?.banner?.[0] || local.images?.todas?.[0] || '';
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
          name: local.name || '',
          type: local.type || 'Restaurante',
          image: local.images?.banner?.[0] || local.images?.todas?.[0] || '',
          address: local.address || '',
          rating: local.rating || 0,
          reviewCount: local.reviewCount || 0,
          status: local.status || 'closed',
        },
        creado_el: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Error loading establishment ${localId}:`, err);
    }
  }

  return favoritesWithDetails;
};
