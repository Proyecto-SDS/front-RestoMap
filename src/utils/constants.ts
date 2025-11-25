// ReservaYa - Application Constants

import type { EstablishmentType } from '../types';

export const ESTABLISHMENT_TYPES: EstablishmentType[] = [
  'Restaurante',
  'Restobar',
  'Bar',
];

export const SANTIAGO_COMMUNES = [
  'Santiago Centro',
  'Providencia',
  'Las Condes',
  'Vitacura',
  'Lo Barnechea',
  'Ñuñoa',
  'La Reina',
  'Peñalolén',
  'Macul',
  'San Joaquín',
  'La Florida',
  'Puente Alto',
  'San Miguel',
  'La Cisterna',
  'El Bosque',
  'Pedro Aguirre Cerda',
  'Lo Espejo',
  'Estación Central',
  'Cerrillos',
  'Maipú',
  'Quinta Normal',
  'Pudahuel',
  'Lo Prado',
  'Cerro Navia',
  'Renca',
  'Quilicura',
  'Huechuraba',
  'Conchalí',
  'Recoleta',
  'Independencia',
] as const;

export const RATING_THRESHOLDS = {
  EXCELLENT: 4.5,
  GOOD: 4.0,
  AVERAGE: 3.0,
} as const;

export const TOAST_DURATION = 3000; // milliseconds

export const MOBILE_BREAKPOINT = 768; // px

export const MAX_GUESTS = 12;
export const MIN_GUESTS = 1;

export const TIME_SLOTS = [
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
] as const;
