/**
 * Servicio para calcular rutas usando Mapbox Directions API
 */

export type TransportMode = 'driving-traffic' | 'walking' | 'cycling';

export interface RouteResult {
  geometry: GeoJSON.LineString;
  distance: number; // metros
  duration: number; // segundos
  mode: TransportMode;
}

export interface RouteError {
  message: string;
  code: string;
}

const MAPBOX_DIRECTIONS_API = 'https://api.mapbox.com/directions/v5/mapbox';

/**
 * Calcula una ruta entre origen y destino usando Mapbox Directions API
 * @param origin Coordenadas de origen [lng, lat]
 * @param destination Coordenadas de destino [lng, lat]
 * @param mode Modo de transporte
 * @returns Resultado de la ruta con geometría, distancia y duración
 */
export async function getRoute(
  origin: [number, number],
  destination: [number, number],
  mode: TransportMode = 'driving-traffic'
): Promise<RouteResult> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Token de Mapbox no configurado');
  }

  // Mapear modos a perfiles de Mapbox
  const profileMap: Record<TransportMode, string> = {
    'driving-traffic': 'driving-traffic',
    walking: 'walking',
    cycling: 'cycling',
  };

  const profile = profileMap[mode];
  const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

  const url =
    `${MAPBOX_DIRECTIONS_API}/${profile}/${coordinates}?` +
    new URLSearchParams({
      access_token: accessToken,
      geometries: 'geojson',
      overview: 'full',
      steps: 'false',
    });

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: No se pudo calcular la ruta`
      );
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No se encontró una ruta disponible');
    }

    const route = data.routes[0];

    return {
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration,
      mode,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al calcular la ruta');
  }
}

/**
 * Formatea la distancia en metros a una cadena legible
 * @param meters Distancia en metros
 * @returns Cadena formateada (ej: "1.5 km" o "500 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Formatea la duración en segundos a una cadena legible
 * @param seconds Duración en segundos
 * @returns Cadena formateada (ej: "15 min" o "1 h 30 min")
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Obtiene el color de la ruta según el modo de transporte
 * @param mode Modo de transporte
 * @returns Color en formato hexadecimal
 */
export function getRouteColor(mode: TransportMode): string {
  const colors: Record<TransportMode, string> = {
    'driving-traffic': '#3B82F6', // Azul
    walking: '#22C55E', // Verde
    cycling: '#F97316', // Naranja
  };
  return colors[mode];
}

/**
 * Obtiene el estilo de línea según el modo de transporte
 * @param mode Modo de transporte
 * @returns Configuración de estilo para la capa de ruta
 */
export function getRouteLineStyle(mode: TransportMode): {
  color: string;
  width: number;
  dashArray?: number[];
} {
  switch (mode) {
    case 'driving-traffic':
      return { color: '#3B82F6', width: 5 };
    case 'walking':
      return { color: '#22C55E', width: 4, dashArray: [2, 4] };
    case 'cycling':
      return { color: '#F97316', width: 4, dashArray: [4, 2] };
    default:
      return { color: '#3B82F6', width: 5 };
  }
}
