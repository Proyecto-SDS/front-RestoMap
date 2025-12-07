// API Client for RestoMap
// Handles all API calls to Flask backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiCallOptions extends RequestInit {
  token?: string;
}

interface ApiError extends Error {
  status?: number;
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
      const error = new Error(errorMessage) as ApiError;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    // No mostrar error en consola para 404 en endpoints de opinión de usuario (comportamiento esperado)
    const is404 = (error as ApiError).status === 404;
    const isUserOpinionEndpoint =
      endpoint.includes('/opiniones/') && endpoint.includes('/user');
    const isFavoriteNotFound = endpoint.includes('/api/favoritos/') && is404;

    // No mostrar en consola errores esperados (404 en opinión de usuario, favoritos no encontrados)
    if (!(is404 && (isUserOpinionEndpoint || isFavoriteNotFound))) {
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
    contrasena: string,
    acepta_terminos: boolean = true
  ) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombre,
        correo,
        telefono,
        contrasena,
        acepta_terminos,
      }),
    }),

  validarRut: (rut: string) =>
    apiCall(`/api/auth/validar-rut/${encodeURIComponent(rut)}`),

  registerEmpresa: (data: {
    rut_empresa: string;
    razon_social: string;
    nombre_local: string;
    telefono_local: string;
    correo_local: string;
    descripcion?: string;
    id_tipo_local: number;
    calle: string;
    numero: number;
    id_comuna: number;
    nombre_gerente: string;
    correo_gerente: string;
    telefono_gerente: string;
    contrasena: string;
    acepta_terminos: boolean;
  }) =>
    apiCall('/api/auth/register-empresa', {
      method: 'POST',
      body: JSON.stringify(data),
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

  checkActiveReservation: (id: string) =>
    apiCall(`/api/locales/${id}/verificar-reserva-activa`),

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

  // Favorite endpoints
  getFavorites: () => apiCall('/api/favoritos/'),

  addFavorite: (localId: string) =>
    apiCall('/api/favoritos/', {
      method: 'POST',
      body: JSON.stringify({ localId }),
    }),

  removeFavorite: (localId: string) =>
    apiCall(`/api/favoritos/${localId}`, {
      method: 'DELETE',
    }),

  checkFavorite: (localId: string) =>
    apiCall(`/api/favoritos/check/${localId}`),

  // ============================================
  // EMPRESA ENDPOINTS - /api/empresa/*
  // ============================================

  // Mesas
  empresa: {
    getMesas: () => apiCall('/api/empresa/mesas/'),
    createMesa: (nombre: string, capacidad: number) =>
      apiCall('/api/empresa/mesas/', {
        method: 'POST',
        body: JSON.stringify({ nombre, capacidad }),
      }),
    updateMesa: (
      id: number,
      data: { nombre?: string; capacidad?: number; descripcion?: string }
    ) =>
      apiCall(`/api/empresa/mesas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateMesaEstado: (id: number, estado: string) =>
      apiCall(`/api/empresa/mesas/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      }),
    updateMesasOrden: (mesas: Array<{ id: number; orden: number }>) =>
      apiCall('/api/empresa/mesas/orden', {
        method: 'PUT',
        body: JSON.stringify({ mesas }),
      }),
    deleteMesa: (id: number) =>
      apiCall(`/api/empresa/mesas/${id}`, { method: 'DELETE' }),
    generarQRMesa: (id: number, numPersonas: number) =>
      apiCall(`/api/empresa/mesas/${id}/qr`, {
        method: 'POST',
        body: JSON.stringify({ num_personas: numPersonas }),
      }),
    getMesaDetalle: (id: number) => apiCall(`/api/empresa/mesas/${id}`),
    getPedidoActivoMesa: (id: number) =>
      apiCall(`/api/empresa/mesas/${id}/pedido-activo`),
    cancelarMesa: (id: number) =>
      apiCall(`/api/empresa/mesas/${id}/cancelar`, { method: 'POST' }),

    // Pedidos
    getPedidos: (estado?: string, mesaId?: string) => {
      const params = new URLSearchParams();
      if (estado) params.append('estado', estado);
      if (mesaId) params.append('mesa_id', mesaId);
      const query = params.toString();
      return apiCall(`/api/empresa/pedidos/${query ? `?${query}` : ''}`);
    },
    getPedido: (id: number) => apiCall(`/api/empresa/pedidos/${id}`),
    updatePedidoEstado: (id: number, estado: string, nota?: string) =>
      apiCall(`/api/empresa/pedidos/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado, nota }),
      }),
    getPedidosCocina: () => apiCall('/api/empresa/pedidos/cocina'),
    getPedidosBarra: () => apiCall('/api/empresa/pedidos/barra'),

    // Empleados
    getEmpleados: () => apiCall('/api/empresa/empleados/'),
    updateEmpleado: (
      id: number,
      data: { nombre?: string; telefono?: string; rol?: string }
    ) =>
      apiCall(`/api/empresa/empleados/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteEmpleado: (id: number) =>
      apiCall(`/api/empresa/empleados/${id}`, { method: 'DELETE' }),

    // Invitaciones de empleados
    createInvitation: (correo: string, rol: string) =>
      apiCall('/api/empresa/empleados/invitaciones', {
        method: 'POST',
        body: JSON.stringify({ correo, rol }),
      }),
    getInvitations: () => apiCall('/api/empresa/empleados/invitaciones'),
    cancelInvitation: (id: number) =>
      apiCall(`/api/empresa/empleados/invitaciones/${id}`, {
        method: 'DELETE',
      }),

    // Productos
    getProductos: (categoria?: string, estado?: string) => {
      const params = new URLSearchParams();
      if (categoria) params.append('categoria', categoria);
      if (estado) params.append('estado', estado);
      const query = params.toString();
      return apiCall(`/api/empresa/productos/${query ? `?${query}` : ''}`);
    },
    createProducto: (data: {
      nombre: string;
      descripcion?: string;
      precio: number;
      categoria_id?: number;
    }) =>
      apiCall('/api/empresa/productos/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateProducto: (
      id: number,
      data: {
        nombre?: string;
        descripcion?: string;
        precio?: number;
        categoria_id?: number;
      }
    ) =>
      apiCall(`/api/empresa/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateProductoEstado: (id: number, estado: string) =>
      apiCall(`/api/empresa/productos/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      }),
    deleteProducto: (id: number) =>
      apiCall(`/api/empresa/productos/${id}`, { method: 'DELETE' }),

    // Reservas
    getReservas: (options?: {
      fecha?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
      estado?: string;
    }) => {
      const params = new URLSearchParams();
      if (options?.fecha) params.append('fecha', options.fecha);
      if (options?.fecha_inicio)
        params.append('fecha_inicio', options.fecha_inicio);
      if (options?.fecha_fin) params.append('fecha_fin', options.fecha_fin);
      if (options?.estado) params.append('estado', options.estado);
      const query = params.toString();
      return apiCall(`/api/empresa/reservas/${query ? `?${query}` : ''}`);
    },
    verificarQRReserva: (codigo: string) =>
      apiCall(`/api/empresa/reservas/verificar-qr/${codigo}`),
    confirmarReserva: (id: number) =>
      apiCall(`/api/empresa/reservas/${id}/confirmar`, { method: 'POST' }),
    cancelarReserva: (id: number) =>
      apiCall(`/api/empresa/reservas/${id}/cancelar`, { method: 'PATCH' }),

    // Stats
    getStats: () => apiCall('/api/empresa/stats/dashboard'),
  },

  // ============================================
  // INVITACIONES PÚBLICAS - /api/invitaciones/*
  // ============================================
  invitaciones: {
    getInvitationDetails: (token: string) =>
      apiCall(`/api/invitaciones/${token}`),
    acceptInvitation: (token: string) =>
      apiCall('/api/invitaciones/aceptar', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    rejectInvitation: (token: string) =>
      apiCall('/api/invitaciones/rechazar', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },

  // ============================================
  // CLIENTE ENDPOINTS - /api/cliente/*
  // ============================================
  cliente: {
    validarQR: (codigo: string) =>
      apiCall('/api/cliente/qr/validar', {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      }),
    getMenu: (codigo: string) => apiCall(`/api/cliente/pedido/${codigo}/menu`),
    agregarProductos: (
      codigo: string,
      productos: Array<{ id: number; cantidad: number; nota?: string }>
    ) =>
      apiCall(`/api/cliente/pedido/${codigo}/agregar`, {
        method: 'POST',
        body: JSON.stringify({ productos }),
      }),
    getEstado: (codigo: string) =>
      apiCall(`/api/cliente/pedido/${codigo}/estado`),
    agregarNota: (codigo: string, cuentaId: number, nota: string) =>
      apiCall(`/api/cliente/pedido/${codigo}/cuenta/${cuentaId}/nota`, {
        method: 'PUT',
        body: JSON.stringify({ nota }),
      }),
    // Obtener pedido activo del usuario (para cualquier dispositivo)
    getPedidoActivo: () => apiCall('/api/cliente/pedido-activo'),
  },
};
