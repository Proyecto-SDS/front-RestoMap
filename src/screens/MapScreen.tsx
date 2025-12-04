'use client';

import { Heart, MapPin, Menu, Search, Star, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBadge } from '../components/badges/StatusBadge';
import { TypeBadge } from '../components/badges/TypeBadge';
import { FilterChip } from '../components/inputs/FilterChip';
import { ConfirmDialog } from '../components/profile/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import type { Establishment, EstablishmentType } from '../types';
import { api } from '../utils/apiClient';
import { ESTABLISHMENT_TYPES } from '../utils/constants';

// Configurar token de Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Validar token de Mapbox
if (!mapboxgl.accessToken) {
  console.error('⚠MAPBOX TOKEN NO CONFIGURADO');
} else {
  console.log('Mapbox token configurado correctamente');
}

// Map center: Santiago, Chile
const SANTIAGO_CENTER: [number, number] = [-70.6693, -33.4489]; // [lng, lat]
const DEFAULT_ZOOM = 12;

// Santiago bounds - Límites geográficos de Santiago y sus comunas
// Southwest corner: Maipú/Cerrillos area
// Northeast corner: Las Condes/Lo Barnechea area
const SANTIAGO_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-70.9, -33.7], // Southwest [lng, lat]
  [-70.4, -33.3], // Northeast [lng, lat]
];

/**
 * PERSONALIZACIÓN DEL MAPA MAPBOX
 *
 * Elementos ocultos actualmente:
 * - POI labels específicos: SOLO restaurantes y tiendas comerciales de Mapbox
 * - Neighbourhood/suburb labels (barrios)
 * - Building number labels (números de edificios)
 *
 * Elementos que se mantienen visibles:
 * Transporte: Metro, buses, estaciones de tren
 * Aeropuertos y terminales
 * Lugares culturales: Museos, teatros, monumentos, galerías
 * Parques y áreas verdes
 * Lugares educativos y religiosos
 * Calles y carreteras (navegación)
 * Nombres de ciudades y países
 * Agua (ríos, lagos)
 * Tus marcadores personalizados
 *
 * Límites del mapa:
 * - Restringido a Santiago y sus comunas
 * - El usuario no puede hacer pan fuera de estos límites
 *
 * Para ocultar más elementos, busca los layer IDs comunes:
 * - 'road-label': etiquetas de calles
 * - 'water-label': etiquetas de cuerpos de agua
 * - 'natural-label': etiquetas de elementos naturales
 * - 'building': edificios en 2D
 * - 'building-extrusion': edificios en 3D
 *
 * Puedes inspeccionar todos los layers disponibles en la consola
 * cuando el mapa cargue.
 */

// Commune coordinates mapping (fallback if API doesn't provide coords)
const COMMUNE_COORDINATES: Record<string, [number, number]> = {
  Santiago: [-70.6506, -33.4372],
  'Santiago Centro': [-70.6506, -33.4372],
  Providencia: [-70.61, -33.4264],
  'Las Condes': [-70.5833, -33.4167],
  Vitacura: [-70.5667, -33.3833],
  Ñuñoa: [-70.5978, -33.4564],
  Maipú: [-70.7667, -33.5167],
  Recoleta: [-70.6333, -33.4167],
  'La Reina': [-70.5333, -33.45],
  Peñalolén: [-70.5333, -33.4833],
};

// Simple map component using Mapbox GL JS
function SimpleMap({
  establishments,
  onMarkerClick,
  selectedCommune,
  selectedEstablishmentId,
  mapRef,
}: {
  establishments: Establishment[];
  onMarkerClick: (est: Establishment) => void;
  selectedCommune: string;
  selectedEstablishmentId: string | null;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Esperar un momento para asegurar que el contenedor tenga dimensiones
    const initMap = () => {
      if (!mapContainer.current) return;

      console.log('🗺Inicializando mapa Mapbox...');

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: SANTIAGO_CENTER,
        zoom: DEFAULT_ZOOM,
        maxBounds: SANTIAGO_BOUNDS, // Restricts map to Santiago area
        minZoom: 10, // Prevent zooming out too far
        maxZoom: 18, // Allow detailed street view
      });

      // Forzar resize después de un breve momento
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          console.log('Mapa redimensionado');
        }
      }, 100);

      // Add navigation controls
      if (mapRef.current) {
        mapRef.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );

        // Wait for the style to load before hiding unwanted layers
        mapRef.current.on('load', () => {
          if (!mapRef.current) return;

          console.log('Estilo del mapa cargado');

          // Forzar resize del mapa para asegurar renderizado correcto
          mapRef.current.resize();
          console.log('Mapa redimensionado después de cargar estilo');

          // Get all layers from the style
          const layers = mapRef.current.getStyle().layers;

          if (!layers) return;

          // LOG: Uncomment to see all available layer IDs in the console
          // This helps you identify which layers to hide
          // console.log('Available layers:', layers.map(l => ({ id: l.id, type: l.type })));

          // Hide specific POI (Points of Interest) labels and icons
          layers.forEach((layer) => {
            // Hide only RESTAURANT and SHOP POI labels
            // Keep: parks, transit, airports, cultural sites, education, religion
            if (layer.id.includes('poi-label')) {
              const layerId = layer.id.toLowerCase();

              // List of POI types to KEEP visible:
              const keepVisible = [
                'park', // Parques
                'natural', // Áreas naturales
                'recreation', // Áreas recreativas
                'transit', // Transporte público
                'airport', // Aeropuertos
                'station', // Estaciones
                'museum', // Museos
                'theatre', // Teatros
                'theater', // Teatros (variación)
                'gallery', // Galerías
                'cultural', // Lugares culturales
                'monument', // Monumentos
                'memorial', // Memoriales
                'historic', // Lugares históricos
                'education', // Educación
                'school', // Escuelas
                'university', // Universidades
                'library', // Bibliotecas
                'religious', // Lugares religiosos
                'church', // Iglesias
                'temple', // Templos
                'worship', // Lugares de culto
              ];

              // Check if this POI should be kept visible
              const shouldKeep = keepVisible.some((keyword) =>
                layerId.includes(keyword)
              );

              // Hide only if it's NOT in our keep list (i.e., hide restaurants/shops)
              if (!shouldKeep) {
                mapRef.current?.setLayoutProperty(
                  layer.id,
                  'visibility',
                  'none'
                );
              }
            }

            // NOTE: We now KEEP transit and airport labels visible
            // The code below is commented out - they are visible by default
            // if (
            //   layer.id.includes('transit-label') ||
            //   layer.id.includes('airport-label')
            // ) {
            //   map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
            // }

            // Hide place labels (neighborhoods, suburbs) but keep city/country names
            if (
              layer.id.includes('place-label') &&
              (layer.id.includes('neighbourhood') ||
                layer.id.includes('suburb'))
            ) {
              mapRef.current?.setLayoutProperty(layer.id, 'visibility', 'none');
            }

            // Hide building labels
            if (layer.id.includes('building-number-label')) {
              mapRef.current?.setLayoutProperty(layer.id, 'visibility', 'none');
            }

            // Optionally: Hide 3D buildings if they interfere
            // Uncomment if you want to remove 3D buildings
            // if (layer.id.includes('building') && layer.type === 'fill-extrusion') {
            //   map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
            // }

            // Optionally: Hide road labels (street names)
            // Uncomment if you want cleaner streets without names
            // if (layer.id.includes('road-label')) {
            //   map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
            // }

            // Optionally: Hide water labels (lake/river names)
            // if (layer.id.includes('water-label') || layer.id.includes('waterway-label')) {
            //   map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
            // }
          });

          console.log(
            'Map loaded. Only restaurant/shop POI hidden. Transit, airports & culture visible.'
          );
          console.log('Map bounds:', SANTIAGO_BOUNDS);
          console.log(
            '🎭 Visible: Transit, Airports, Museums, Parks, Cultural sites'
          );

          // Resize final después de que todo esté configurado
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.resize();
              console.log('Resize final aplicado');
            }
          }, 200);
        });
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(initMap, 50);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when establishments change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    establishments.forEach((est) => {
      const colors: Record<string, string> = {
        Restaurante: '#F97316',
        Restobar: '#EA580C',
        Bar: '#FB923C',
      };

      const color = colors[est.type] || '#F97316'; // Default to orange if type not found
      const opacity = est.status === 'open' ? 1 : 0.5;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '50px';
      el.style.cursor = 'pointer';
      el.style.opacity = opacity.toString();

      el.innerHTML = `
        <div class="marker-inner" style="transition: transform 0.2s; transform-origin: center bottom;">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" style="filter: ${
            selectedEstablishmentId === est.id
              ? `drop-shadow(0 0 12px ${color}99)`
              : 'none'
          }; transition: filter 0.2s; display: block;">
            <path
              d="M20 0C9.52 0 0 8.84 0 20.9C0 31.54 12.4 45.34 17.28 50.66C18.78 52.28 21.22 52.28 22.72 50.66C27.6 45.34 40 31.54 40 20.9C40 8.84 30.48 0 20 0Z"
              fill="${color}"
            />
            <circle cx="20" cy="20" r="8" fill="white" />
          </svg>
        </div>
      `;

      const innerEl = el.querySelector('.marker-inner') as HTMLElement;

      el.addEventListener('mouseenter', () => {
        if (innerEl) {
          innerEl.style.transform = 'scale(1.3)';
        }
      });

      el.addEventListener('mouseleave', () => {
        if (innerEl) {
          innerEl.style.transform = 'scale(1)';
        }
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(est.coordinates)
        .addTo(mapRef.current!);

      // Add click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onMarkerClick(est);
      });

      markersRef.current.set(est.id, marker);
    });
  }, [establishments, selectedEstablishmentId, onMarkerClick, mapRef]);

  // Fly to commune when selected
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedCommune && COMMUNE_COORDINATES[selectedCommune]) {
      mapRef.current.flyTo({
        center: COMMUNE_COORDINATES[selectedCommune],
        zoom: 13,
        duration: 1500,
      });
    } else if (establishments.length > 0) {
      mapRef.current.flyTo({
        center: SANTIAGO_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 1500,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommune, establishments.length]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ position: 'relative' }}
    />
  );
}

// Sidebar component
interface SidebarProps {
  establishments: Establishment[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedId: string | null;
  onSelectEstablishment: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isLoggedIn: boolean;
}

function Sidebar({
  establishments,
  totalCount,
  searchQuery,
  onSearchChange,
  selectedId,
  onSelectEstablishment,
  favorites,
  onToggleFavorite,
  isLoggedIn,
}: SidebarProps) {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected establishment
  useEffect(() => {
    if (selectedId && selectedRef.current && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const selectedRect = selectedRef.current.getBoundingClientRect();

      // Check if element is out of view
      const isOutOfView =
        selectedRect.top < listRect.top ||
        selectedRect.bottom > listRect.bottom;

      if (isOutOfView) {
        selectedRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedId]);

  return (
    <div className="w-[280px] lg:w-[320px] h-full bg-white shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] shrink-0">
        <h3 className="text-[#334155] mb-1">Establecimientos en vista</h3>
        <p className="text-sm text-[#64748B]">
          {establishments.length} de {totalCount} establecimientos
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#E2E8F0] shrink-0">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar en vista..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#334155]"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar">
        {establishments.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin size={48} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B]">
              {searchQuery
                ? 'No se encontraron resultados'
                : 'No hay establecimientos en esta vista'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {establishments.slice(0, 50).map((est) => (
              <div
                key={est.id}
                ref={selectedId === est.id ? selectedRef : null}
                className={`
                  border rounded-xl overflow-hidden transition-all
                  hover:shadow-lg hover:-translate-y-1
                  ${
                    selectedId === est.id
                      ? 'border-[#F97316] bg-linear-to-br from-[#FFF7ED] to-[#FFEDD5] shadow-md'
                      : 'border-[#E2E8F0] bg-white hover:border-[#F97316]'
                  }
                `}
              >
                {/* Área clickeable para centrar mapa */}
                <button
                  onClick={() => onSelectEstablishment(est.id)}
                  className="w-full p-3 text-left hover:bg-white/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-semibold text-[#334155] line-clamp-1 flex-1">
                      {est.name}
                    </h4>
                    <StatusBadge
                      status={est.status}
                      closingTime={est.closingTime}
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={est.type} />
                    {est.rating && (
                      <div className="flex items-center gap-1 text-xs text-[#64748B]">
                        <Star
                          size={12}
                          className="fill-[#F97316] text-[#F97316]"
                        />
                        <span className="font-medium">{est.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="text-[#F97316] shrink-0 w-3 h-3 md:w-4 md:h-4" />
                    <p className="text-xs text-[#334155]">
                      {est.address}, {est.commune}
                    </p>
                  </div>

                  {est.description && (
                    <p className="text-xs text-[#64748B] italic line-clamp-2 leading-relaxed">
                      {est.description}
                    </p>
                  )}
                </button>

                {/* Botón para navegar al perfil y toggle de favorito */}
                <div className="flex border-t border-[#E2E8F0]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/establecimientos/${est.id}`);
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-[#F97316] hover:text-[#EA580C] hover:bg-[#F97316]/5 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Ver local</span>
                    <span className="text-sm">→</span>
                  </button>
                  {isLoggedIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(est.id);
                      }}
                      className="px-3 py-2 hover:bg-[#F97316]/5 transition-colors border-l border-[#E2E8F0]"
                      aria-label={
                        favorites.includes(est.id)
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos'
                      }
                    >
                      <Heart
                        size={18}
                        className={
                          favorites.includes(est.id)
                            ? 'text-[#EF4444] fill-[#EF4444]'
                            : 'text-[#94A3B8]'
                        }
                      />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile Drawer component
interface MobileDrawerProps extends SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileDrawer({
  establishments,
  totalCount,
  searchQuery,
  onSearchChange,
  selectedId,
  onSelectEstablishment,
  isOpen,
  onClose,
  favorites,
  onToggleFavorite,
  isLoggedIn,
}: MobileDrawerProps) {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected establishment
  useEffect(() => {
    if (selectedId && selectedRef.current && listRef.current && isOpen) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [selectedId, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-1000" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-1001 max-h-[70vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[#334155]">Establecimientos</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-[#64748B]">
            {establishments.length} de {totalCount} en vista
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#E2E8F0]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {establishments.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin size={48} className="text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[#64748B]">
                {searchQuery
                  ? 'No se encontraron resultados'
                  : 'No hay establecimientos en esta vista'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {establishments.slice(0, 50).map((est) => (
                <div
                  key={est.id}
                  ref={selectedId === est.id ? selectedRef : null}
                  className={`
                    border rounded-xl overflow-hidden transition-all
                    ${
                      selectedId === est.id
                        ? 'border-[#F97316] bg-linear-to-br from-[#FFF7ED] to-[#FFEDD5] shadow-md'
                        : 'border-[#E2E8F0] bg-white'
                    }
                  `}
                >
                  {/* Área clickeable para centrar mapa y cerrar drawer */}
                  <button
                    onClick={() => {
                      onSelectEstablishment(est.id);
                      onClose();
                    }}
                    className="w-full p-3 text-left active:bg-white/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-[#334155] line-clamp-1 flex-1">
                        {est.name}
                      </h4>
                      <StatusBadge
                        status={est.status}
                        closingTime={est.closingTime}
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <TypeBadge type={est.type} />
                      {est.rating && (
                        <div className="flex items-center gap-1 text-xs text-[#64748B]">
                          <Star
                            size={12}
                            className="fill-[#F97316] text-[#F97316]"
                          />
                          <span className="font-medium">{est.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="text-[#F97316] shrink-0 w-3 h-3 md:w-4 md:h-4" />
                      <p className="text-xs text-[#334155]">
                        {est.address}, {est.commune}
                      </p>
                    </div>

                    {est.description && (
                      <p className="text-xs text-[#64748B] italic line-clamp-2 leading-relaxed">
                        {est.description}
                      </p>
                    )}
                  </button>

                  {/* Botón para navegar al perfil y toggle de favorito */}
                  <div className="flex border-t border-[#E2E8F0]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/establecimientos/${est.id}`);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium text-[#F97316] active:text-[#EA580C] active:bg-[#F97316]/10 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Ver local</span>
                      <span className="text-sm">→</span>
                    </button>
                    {isLoggedIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(est.id);
                        }}
                        className="px-3 py-2 active:bg-[#F97316]/10 transition-colors border-l border-[#E2E8F0]"
                        aria-label={
                          favorites.includes(est.id)
                            ? 'Quitar de favoritos'
                            : 'Agregar a favoritos'
                        }
                      >
                        <Heart
                          size={18}
                          className={
                            favorites.includes(est.id)
                              ? 'text-[#EF4444] fill-[#EF4444]'
                              : 'text-[#94A3B8]'
                          }
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedCommune] = useState('');
  const [selectedType, setSelectedType] = useState<EstablishmentType | 'Todos'>(
    'Todos'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    establishmentId: string | null;
  }>({ isOpen: false, establishmentId: null });

  // Load establishments from API
  useEffect(() => {
    const loadEstablishments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getEstablishments();

        // Transform API response to match Establishment interface
        // Transform API response to match Establishment interface
        const transformedData: Establishment[] = data.map((item: Establishment) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          address: item.address,
          commune: item.commune,
          phone: item.phone,
          email: item.email,
          description: item.description,
          image:
            item.image ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          rating: item.rating,
          reviewCount: item.reviewCount,
          status: item.status,
          closingTime: item.closingTime,
          coordinates: item.coordinates,
        }));

        setEstablishments(transformedData);
      } catch (err) {
        console.error('Error loading establishments:', err);
        setError('Error al cargar los establecimientos');
      } finally {
        setIsLoading(false);
      }
    };

    loadEstablishments();
  }, []);

  // Cargar favoritos si está logueado
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isLoggedIn) {
        setFavorites([]);
        setShowOnlyFavorites(false);
        return;
      }

      try {
        const response = await api.getFavorites();
        const favoriteIds = response.favoritos.map((fav: { localId: string }) => fav.localId);
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
    };

    loadFavorites();
  }, [isLoggedIn]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter establishments based on selected filters
  const filteredEstablishments = useMemo(() => {
    let filtered = establishments;

    if (selectedCommune && selectedCommune !== '') {
      filtered = filtered.filter((est) => est.commune === selectedCommune);
    }

    if (selectedType !== 'Todos') {
      filtered = filtered.filter((est) => est.type === selectedType);
    }

    // Filtrar por favoritos si está activado
    if (showOnlyFavorites && isLoggedIn) {
      filtered = filtered.filter((est) => favorites.includes(est.id));
    }

    return filtered;
  }, [
    establishments,
    selectedCommune,
    selectedType,
    showOnlyFavorites,
    favorites,
    isLoggedIn,
  ]);

  // Filter visible establishments by search
  const searchedEstablishments = useMemo(() => {
    if (!debouncedSearch) return filteredEstablishments;

    return filteredEstablishments.filter((est) =>
      est.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [filteredEstablishments, debouncedSearch]);

  const handleTypeFilter = (type: EstablishmentType | 'Todos') => {
    setSelectedType(type);
  };

  const handleMarkerClick = useCallback((establishment: Establishment) => {
    setSelectedEstablishmentId(establishment.id);

    // En mobile, abrir el drawer cuando se hace click en un marcador
    if (window.innerWidth < 768) {
      // md breakpoint
      setIsDrawerOpen(true);
    }
  }, []);

  const handleSelectEstablishment = (id: string) => {
    setSelectedEstablishmentId(id);

    // Find the establishment and fly to it on the map
    const establishment = establishments.find((est) => est.id === id);
    if (establishment && mapRef.current) {
      mapRef.current.flyTo({
        center: establishment.coordinates,
        zoom: 15,
        duration: 1000,
      });
    }
  };

  const handleToggleFavorite = async (localId: string) => {
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para agregar favoritos');
      router.push('/login');
      return;
    }

    if (favorites.includes(localId)) {
      setConfirmDialog({ isOpen: true, establishmentId: localId });
    } else {
      try {
        await api.addFavorite(localId);
        setFavorites([...favorites, localId]);
      } catch (error) {
        console.error('Error al agregar favorito:', error);
        if (error instanceof Error) {
            alert(error.message || 'Error al agregar favorito');
        } else {
            alert('Error al agregar favorito');
        }
      }
    }
  };

  const handleConfirmRemoveFavorite = async () => {
    const { establishmentId } = confirmDialog;
    if (!establishmentId) return;

    try {
      await api.removeFavorite(establishmentId);
      setFavorites(favorites.filter((id) => id !== establishmentId));
      setConfirmDialog({ isOpen: false, establishmentId: null });
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      if (error instanceof Error) {
          alert(error.message || 'Error al eliminar favorito');
      } else {
          alert('Error al eliminar favorito');
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Filter Chips */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <FilterChip
              label="Todos"
              active={selectedType === 'Todos' && !showOnlyFavorites}
              onClick={() => {
                handleTypeFilter('Todos');
                setShowOnlyFavorites(false);
              }}
            />
            {ESTABLISHMENT_TYPES.map((type) => (
              <FilterChip
                key={type}
                label={type}
                active={selectedType === type && !showOnlyFavorites}
                onClick={() => {
                  handleTypeFilter(type);
                  setShowOnlyFavorites(false);
                }}
              />
            ))}
            {isLoggedIn && (
              <FilterChip
                label="Mis Favoritos"
                active={showOnlyFavorites}
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop/Tablet only) */}
        <div className="hidden md:block">
          <Sidebar
            establishments={searchedEstablishments}
            totalCount={filteredEstablishments.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedId={selectedEstablishmentId}
            onSelectEstablishment={handleSelectEstablishment}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F1F5F9] z-1000">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F97316] border-t-transparent mb-4"></div>
                <p className="text-[#64748B]">Cargando establecimientos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F1F5F9] z-1000">
              <div className="text-center">
                <MapPin size={48} className="text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#64748B] mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : null}

          <SimpleMap
            establishments={filteredEstablishments}
            onMarkerClick={handleMarkerClick}
            selectedCommune={selectedCommune}
            selectedEstablishmentId={selectedEstablishmentId}
            mapRef={mapRef}
          />

          {/* Mobile: List button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden fixed bottom-6 left-6 z-999 bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 hover:shadow-xl transition-shadow"
          >
            <Menu size={20} className="text-[#334155]" />
            <span className="text-sm text-[#334155]">
              Listado ({searchedEstablishments.length})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        establishments={searchedEstablishments}
        totalCount={filteredEstablishments.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedId={selectedEstablishmentId}
        onSelectEstablishment={handleSelectEstablishment}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        isLoggedIn={isLoggedIn}
      />

      {confirmDialog.isOpen && (
        <ConfirmDialog
          title="¿Quitar de favoritos?"
          message="¿Estás seguro que deseas quitar este establecimiento de tus favoritos?"
          confirmText="Sí, quitar"
          cancelText="Cancelar"
          onConfirm={handleConfirmRemoveFavorite}
          onCancel={() =>
            setConfirmDialog({ isOpen: false, establishmentId: null })
          }
          isDestructive={false}
        />
      )}
    </div>
  );
}
