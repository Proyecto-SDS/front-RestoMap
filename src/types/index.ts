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

export interface Table {
  id: string;
  establishmentId: string;
  capacity: number;
  isAvailable: boolean;
  location?: string; // e.g., "Window", "Terrace", "Interior"
}

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
  codigoQR?: string; // Código QR en texto
  qrImage?: string; // Imagen QR en base64
}

// Extended types for detailed establishment views

export interface MenuItemCategory {
  id: string;
  nombre: string;
  productos: MenuItem[];
}

export interface MenuItem {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  estado: 'disponible' | 'agotado' | 'inactivo';
  imagen?: string;
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

export interface MesaInfo {
  id: string;
  nombre: string;
  capacidad: number;
  estado: 'disponible' | 'reservada' | 'ocupada' | 'fuera_de_servicio';
}

export interface ReservaInfo {
  id: number;
  mesaId: string;
  mesaNombre: string;
  horaReserva: string;
  estado: string;
}

// Component Props Types

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
