// src/utils/apiClient.ts
// Cliente API robusto para conectar con Flask

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en llamada a ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // --- ENDPOINTS PÚBLICOS ---

  // Obtener locales (Para el Mapa)
  getEstablishments: async () => {
    const data = await apiCall('/api/locales/');
    // Adaptador seguro para evitar "undefined"
    return data.map((item: any) => ({
      id: item.id,
      name: item.nombre || 'Local sin nombre',
      type: item.tipo || 'Restaurante',
      rating: parseFloat(item.rating || '4.5'),
      address: parseAddress(item.direccion),
      // AQUÍ ARREGLAMOS LOS HORARIOS
      openTime: item.hora_apertura || item.open_time || '09:00',
      closeTime: item.hora_cierre || item.close_time || '22:00',
      lat: parseFloat(item.latitud || item.lat || '-33.4489'),
      lng: parseFloat(item.longitud || item.lng || '-70.6693'),
      distanceKm: parseFloat(item.distancia_km || '0'),
    }));
  },

  // Obtener detalle de un local
  getEstablishment: async (id: string) => {
    const item = await apiCall(`/api/locales/${id}`);
    return {
      ...item,
      // Aseguramos que el menú exista
      menu: item.productos || item.menu || [],
    };
  },

  // --- ENDPOINTS ADMIN (Reservas y Pedidos) ---

  // Obtener todas las reservas (Para la tabla y cocina)
  getAdminReservations: async () => {
    try {
      const data = await apiCall('/api/reservas/local');
      return data.map((item: any) => ({
        id: String(item.id),
        clientName: item.nombre_cliente || 'Cliente',
        clientEmail: item.email_cliente || 'Sin email',
        date: item.fecha,
        time: item.hora,
        pax: item.cantidad_personas,
        status: item.estado ? item.estado.toLowerCase() : 'pendiente',
        table: item.mesa || `M-${item.id}`, // Mesa ficticia si no viene
        // Mapeamos los productos si vienen
        items:
          item.productos?.map((p: any) => ({
            name: p.nombre_producto || 'Producto',
            quantity: p.cantidad || 1,
            notes: p.notas || '',
          })) || [],
        total: item.total || 0,
      }));
    } catch (error) {
      return [];
    }
  },

  // Obtener estadísticas del dashboard
  getDashboardStats: async () => {
    try {
      const data = await apiCall('/api/gestionlocal/dashboard/stats');
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        productos: { total: 0, disponibles: 0, agotados: 0 },
        mesas: { total: 0, disponibles: 0, ocupadas: 0, reservadas: 0 },
        reservas: { total: 0, pendientes: 0, confirmadas: 0 },
      };
    }
  },

  // Actualizar estado (Aceptar/Rechazar/Cocinar)
  updateReservationStatus: (id: string | number, estado: string) =>
    apiCall(`/api/reservas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }),

  // --- ENDPOINTS GESTION LOCAL ---

  // --- Personal ---
  getPersonal: () => apiCall('/api/gestionlocal/personal'),

  createEmpleado: (empleadoData: any) =>
    apiCall('/api/gestionlocal/personal', {
      method: 'POST',
      body: JSON.stringify(empleadoData),
    }),

  updateEmpleado: (idEmpleado: number, empleadoData: any) =>
    apiCall(`/api/gestionlocal/personal/${idEmpleado}`, {
      method: 'PUT',
      body: JSON.stringify(empleadoData),
    }),

  deleteEmpleado: (idEmpleado: number) =>
    apiCall(`/api/gestionlocal/personal/${idEmpleado}`, {
      method: 'DELETE',
    }),

  // --- Categorías ---
  getCategorias: () => apiCall('/api/gestionlocal/categorias'),

  // --- Mesas ---
  getMesas: () => apiCall('/api/gestionlocal/mis-mesas'),

  createMesa: (mesaData: any) =>
    apiCall('/api/gestionlocal/mis-mesas', {
      method: 'POST',
      body: JSON.stringify(mesaData),
    }),

  updateMesa: (idMesa: number, mesaData: any) =>
    apiCall(`/api/gestionlocal/mis-mesas/${idMesa}`, {
      method: 'PUT',
      body: JSON.stringify(mesaData),
    }),

  deleteMesa: (idMesa: number) =>
    apiCall(`/api/gestionlocal/mis-mesas/${idMesa}`, {
      method: 'DELETE',
    }),

  // --- Productos ---
  getProductos: () => apiCall('/api/gestionlocal/mis-productos'),

  createProducto: (productoData: any) =>
    apiCall('/api/gestionlocal/mis-productos', {
      method: 'POST',
      body: JSON.stringify(productoData),
    }),

  updateProducto: (idProducto: number, productoData: any) =>
    apiCall(`/api/gestionlocal/mis-productos/${idProducto}`, {
      method: 'PUT',
      body: JSON.stringify(productoData),
    }),

  deleteProducto: (idProducto: number) =>
    apiCall(`/api/gestionlocal/mis-productos/${idProducto}`, {
      method: 'DELETE',
    }),

  // --- AUTH ---
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

  // --- NUEVO: Endpoint para el Panel de Admin ---
  getAdminReservations: async () => {
    // 1. Llamamos al endpoint base de reservas (que el backend usa para listar)
    const data = await apiCall('/api/reservas/');
    console.log('Raw data from /api/reservas/:', data);

    // 2. Adaptamos los datos de Python (snake_case) a React (camelCase)
    // Usamos 'any' en item porque no tenemos la interfaz de Python definida aquí
    return data.map((item: any) => ({
      id: String(item.id),
      clientName: item.nombre_cliente || 'Cliente Anónimo',
      clientEmail: item.email_cliente || 'Sin email',
      date: item.fecha,
      time: item.hora,
      pax: item.cantidad_personas,
      status: item.estado ? item.estado.toLowerCase() : 'pendiente',
      requestDate: item.solicitado_hace || 'Reciente',
      table: item.mesa || 'Sin asignar',
    }));
  },

  // ADMIN PANEL - MENU ENDPOINTS (CU-09)
  getMenuItems: () => apiCall('/api/admin/menu'),

  createMenuItem: (data: {
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    imagen?: string;
  }) =>
    apiCall('/api/admin/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMenuItem: (
    id: string,
    data: {
      nombre?: string;
      descripcion?: string;
      precio?: number;
      categoria?: string;
      imagen?: string;
    }
  ) =>
    apiCall(`/api/admin/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleMenuItemStock: (id: string, enStock: boolean) =>
    apiCall(`/api/admin/menu/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ enStock }),
    }),

  deleteMenuItem: (id: string) =>
    apiCall(`/api/admin/menu/${id}`, {
      method: 'DELETE',
    }),

  // ADMIN PANEL - MESAS ENDPOINTS (CU-10)
  getTables: () => apiCall('/api/admin/tables'),

  createTable: (data: { nombre: string; numero: number; capacidad: number }) =>
    apiCall('/api/admin/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTable: (
    id: string,
    data: {
      nombre?: string;
      numero?: number;
      capacidad?: number;
    }
  ) =>
    apiCall(`/api/admin/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleTableBlock: (id: string, estaBloqueada: boolean) =>
    apiCall(`/api/admin/tables/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ estaBloqueada }),
    }),

  deleteTable: (id: string) =>
    apiCall(`/api/admin/tables/${id}`, {
      method: 'DELETE',
    }),

  // ADMIN PANEL - STAFF ENDPOINTS (CU-11)
  getStaff: () => apiCall('/api/admin/staff'),

  createStaffInvitation: (data: { email: string; rol: string }) =>
    apiCall('/api/admin/staff/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStaff: (
    id: string,
    data: {
      nombre?: string;
      email?: string;
      telefono?: string;
      rol?: string;
    }
  ) =>
    apiCall(`/api/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  removeStaff: (id: string) =>
    apiCall(`/api/admin/staff/${id}`, {
      method: 'DELETE',
    }),

  updateStaffStatus: (id: string, estado: string) =>
    apiCall(`/api/admin/staff/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
};

// Helper para limpiar direcciones sucias
function parseAddress(addr: any): string {
  if (!addr) return 'Dirección no disponible';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    return [addr.calle, addr.numero, addr.comuna].filter(Boolean).join(', ');
  }
  return 'Ubicación desconocida';
}
