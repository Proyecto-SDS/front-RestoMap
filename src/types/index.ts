// ReservaYa - TypeScript Type Definitions

export type EstablishmentType = 'Restaurante' | 'Restobar' | 'Bar';
export type EstablishmentStatus = 'open' | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType;
  address: string;
  commune: string;
  phone: string;
  email?: string;
  description?: string;
  image: string;
  rating: number | null;
  reviewCount: number;
  status: EstablishmentStatus;
  openingHours?: string;
  closingTime?: string | null;
  priceRange?: number; // 1-4 ($, $$, $$$, $$$$)
  coordinates: [number, number]; // [longitude, latitude]
}

// --- Mesas (Unificado) ---
// Definimos el Enum para uso estricto, y el Type para flexibilidad
export enum TableStatusEnum {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADA = 'OCUPADA',
  RESERVADA = 'RESERVADA',
  BLOQUEADA = 'BLOQUEADA',
  FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
}

export type TableStatus =
  | 'disponible'
  | 'ocupada'
  | 'reservada'
  | 'fuera_de_servicio'
  | 'bloqueada'
  | 'DISPONIBLE'
  | 'OCUPADA'
  | 'RESERVADA'
  | 'BLOQUEADA';

export interface Table {
  id: string;
  establishmentId: string;
  capacity: number;
  isAvailable: boolean;
  location?: string; // e.g., "Window", "Terrace", "Interior"
}

// Para el Panel Admin
export interface AdminTable {
  id: string;
  nombre: string; // "Mesa 1", "Terraza 2"
  numero: number; // Número único identificador
  capacidad: number;
  estaBloqueada: boolean;
  estado: TableStatus;
  localId: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface MesaInfo {
  id: string;
  nombre: string;
  capacidad: number;
  estado: TableStatus;
}

// --- Productos y Menú (Unificado) ---
export enum MenuCategory {
  ENTRADAS = 'ENTRADAS',
  PRINCIPALES = 'PRINCIPALES',
  POSTRES = 'POSTRES',
  BEBIDAS = 'BEBIDAS',
  BEBIDAS_ALCOHOLICAS = 'BEBIDAS_ALCOHOLICAS',
  ESPECIALES = 'ESPECIALES',
}

export type ProductStatus = 'disponible' | 'agotado' | 'inactivo';

export interface MenuItem {
  id: string; // Unificamos a string (si viene number se convierte)
  nombre: string;
  descripcion?: string;
  precio: number;
  estado: ProductStatus;
  imagen?: string;
  // Campos extra del admin
  categoria?: string | MenuCategory;
  enStock?: boolean;
}

export interface MenuItemCategory {
  id: string;
  nombre: string;
  productos: MenuItem[];
}

// Para el Panel Admin (Más detallado)
export interface AdminMenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: MenuCategory;
  enStock: boolean;
  imagen?: string;
  localId: string;
  creadoEn: string;
  actualizadoEn: string;
}

// --- Payloads (Para crear/editar) ---
export interface CreateTablePayload {
  nombre: string;
  capacidad: number;
  estado?: TableStatus;
}

export interface UpdateTablePayload {
  nombre?: string;
  capacidad?: number;
  estado?: TableStatus;
}

export interface CreateProductPayload {
  nombre: string;
  descripcion?: string;
  precio: number;
  id_categoria: number;
  estado?: ProductStatus;
}

export interface UpdateProductPayload {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  id_categoria?: number;
  estado?: ProductStatus;
}

// --- Staff / Personal (Unificado) ---
export enum StaffRole {
  MESERO = 'MESERO',
  COCINERO = 'COCINERO',
  CAJERO = 'CAJERO',
  GERENTE = 'GERENTE',
  BARTENDER = 'BARTENDER',
}

export enum StaffStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
}

export interface StaffMember {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: string | StaffRole;
  fecha_registro: string;
  // Campos extra
  estado?: StaffStatus;
}

// --- Reservas y Opiniones ---
export interface Rating {
  id: string;
  establishmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  helpful?: number;
}

export interface Reservation {
  id: string;
  userId: string;
  establishmentId: string;
  tableId: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
}

export interface ReservaInfo {
  id: number;
  mesaId: string;
  mesaNombre: string;
  horaReserva: string;
  estado: string;
}

export interface Review {
  id: number;
  usuario: string;
  usuarioId?: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
}

export interface UserOpinion {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Schedule {
  dia: string;
  diaNumero: number;
  apertura: string;
  cierre: string;
  abierto: boolean;
  tipo: 'normal' | 'especial' | 'evento' | 'cerrado';
}

export interface SocialNetwork {
  tipo: string;
  usuario: string;
  url: string;
}

export interface DetailedEstablishment extends Establishment {
  images: {
    banner: string[];
    hero: string[];
    logo: string | null;
    galeria: string[];
    todas: string[];
  };
  horarios: Schedule[];
  redesSociales: SocialNetwork[];
  reviews?: Review[];
}

// --- Utilidades de UI y Respuesta API ---

export interface ButtonSize {
  sm: string;
  md: string;
  lg: string;
}

export interface ToastType {
  success: string;
  error: string;
  info: string;
  warning: string;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface TabItem {
  id: string;
  label: string;
  value: string;
}

export interface ApiResponse<T> {
  exito: boolean;
  datos?: T;
  mensaje?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}
