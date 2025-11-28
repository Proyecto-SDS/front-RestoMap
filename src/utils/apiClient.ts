// API Client for ReservaYa
// Handles all API calls to Flask backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiCallOptions extends RequestInit {
  token?: string;
}

export async function apiCall(endpoint: string, options: ApiCallOptions = {}) {
  const token =
    options.token ||
    (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || errorData.message || `API error: ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    // No mostrar error en consola para 404 en endpoints de opinión de usuario (comportamiento esperado)
    const is404 = (error as any).status === 404;
    const isUserOpinionEndpoint =
      endpoint.includes('/opiniones/') && endpoint.includes('/user');

    if (!(is404 && isUserOpinionEndpoint)) {
      console.error('API call error:', error);
    }

    throw error;
  }
}

// Specific API methods
export const api = {
  // Establishments endpoints - /api/locales/
  getEstablishments: () => apiCall('/api/locales/'),

  getEstablishment: (id: string) => apiCall(`/api/locales/${id}`),

  // Auth endpoints - /api/auth/
  login: (correo: string, contrasena: string) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    }),

  register: (
    nombre: string,
    correo: string,
    telefono: string,
    contrasena: string
  ) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, telefono, contrasena }),
    }),

  logout: () =>
    apiCall('/api/auth/logout', {
      method: 'POST',
    }),

  // User endpoints - /api/auth/profile
  getProfile: () => apiCall('/api/auth/profile'),

  updateProfile: (nombre: string, telefono: string) =>
    apiCall('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ nombre, telefono }),
    }),

  // Establishment detail endpoints - /api/locales/{id}/
  getEstablishmentProducts: (id: string) =>
    apiCall(`/api/locales/${id}/productos`),

  getEstablishmentTables: (id: string) => apiCall(`/api/locales/${id}/mesas`),

  getEstablishmentReservations: (id: string, fecha: string) =>
    apiCall(`/api/locales/${id}/reservas?fecha=${fecha}`),

  getAvailableTimeSlots: (id: string, fecha: string) =>
    apiCall(`/api/locales/${id}/horarios-disponibles?fecha=${fecha}`),

  getAvailableTables: (id: string, fecha: string, hora: string) =>
    apiCall(`/api/locales/${id}/mesas-disponibles?fecha=${fecha}&hora=${hora}`),

  // Opinion endpoints
  getEstablishmentOpinions: (
    id: string,
    page: number = 1,
    limit: number = 10
  ) => apiCall(`/api/locales/${id}/opiniones?page=${page}&limit=${limit}`),

  getUserOpinionForEstablishment: (id: string) =>
    apiCall(`/api/opiniones/${id}/user`),

  createOpinion: (localId: string, puntuacion: number, comentario: string) =>
    apiCall('/api/opiniones/', {
      method: 'POST',
      body: JSON.stringify({ localId, puntuacion, comentario }),
    }),

  // Reservation endpoints - /api/reservas/
  createReservation: (
    localId: string,
    mesaId: string,
    fecha: string,
    hora: string,
    numeroPersonas: number
  ) =>
    apiCall('/api/reservas/', {
      method: 'POST',
      body: JSON.stringify({
        localId,
        mesaId,
        fecha,
        hora,
        numeroPersonas,
      }),
    }),

  getMyReservations: () => apiCall('/api/reservas/mis-reservas'),

  // Opinion endpoints - user opinions
  getMyOpinions: () => apiCall('/api/opiniones/mis-opiniones'),
};
