import { FavoriteData } from '../components/profile/FavoriteCard';
import { OpinionData } from '../components/profile/OpinionCard';
import { ReservationData } from '../components/profile/ReservationCard';
import { api } from '../utils/apiClient';

interface ReservaItem {
  id: string | number;
  localImagen?: string;
  localDireccion?: string;
  localTipo?: string;
  localId?: string;
  localNombre?: string;
  fecha: string;
  hora: string;
  mesas?: string[];
  estado: string;
  codigoQR?: string;
  qrImage?: string;
}

interface ReservasResponse {
  reservas?: ReservaItem[];
}

interface OpinionItem {
  id: string | number;
  localId?: string;
  localNombre?: string;
  puntuacion?: number;
  comentario?: string;
  fecha?: string;
}

interface OpinionesResponse {
  opiniones?: OpinionItem[];
}

interface FavoritoItem {
  localId: string;
}

interface FavoritosResponse {
  favoritos?: FavoritoItem[];
}

export const mapReservations = async (
  reservasRes: ReservasResponse
): Promise<ReservationData[]> => {
  const reservas = reservasRes.reservas || [];
  const mappedReservations: ReservationData[] = [];

  for (const r of reservas) {
    // Usar datos proporcionados por el backend
    const imagen = r.localImagen || '';
    const direccion = r.localDireccion || '';
    const tipoRaw = r.localTipo || 'Restaurante';
    
    // Map backend type to frontend type
    let tipo: 'Restaurante' | 'Restobar' | 'Bar' = 'Restaurante';
    if (tipoRaw === 'Restobar' || tipoRaw === 'Bar') {
      tipo = tipoRaw;
    }

    mappedReservations.push({
      id: r.id.toString(),
      establishment: {
        id: r.localId || '',
        name: r.localNombre || '',
        type: tipo,
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
      qrImage: r.qrImage || undefined,
    });
  }

  return mappedReservations;
};

export const mapOpinions = async (
  opinionesRes: OpinionesResponse
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
        type: 'Restaurante',
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
  favoritosRes: FavoritosResponse
): Promise<FavoriteData[]> => {
  const favoritoIds = (favoritosRes.favoritos || []).map((f) => f.localId);
  const favoritesWithDetails: FavoriteData[] = [];

  for (const localId of favoritoIds) {
    try {
      const local = await api.getEstablishment(localId);
      
      const tipoRaw = local.type || 'Restaurante';
      let tipo: 'Restaurante' | 'Restobar' | 'Bar' = 'Restaurante';
      if (tipoRaw === 'Restobar' || tipoRaw === 'Bar') {
        tipo = tipoRaw;
      }

      favoritesWithDetails.push({
        id: local.id,
        establishment: {
          id: local.id,
          name: local.name || '',
          type: tipo,
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
