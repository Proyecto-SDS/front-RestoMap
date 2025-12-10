'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface DireccionData {
  calle: string;
  numero: string;
  comuna: string;
  latitud: number;
  longitud: number;
  direccionCompleta: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

interface UseAddressSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: MapboxFeature[];
  isLoading: boolean;
  error: string | null;
  clearResults: () => void;
  parseFeature: (feature: MapboxFeature) => DireccionData;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

// Bounding box de Santiago metropolitano
const SANTIAGO_BBOX = '-70.85,-33.65,-70.48,-33.35';

export function useAddressSearch(): UseAddressSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchAddress = useCallback(async (searchQuery: string) => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (searchQuery.length < MIN_CHARS) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=CL&` +
        `bbox=${SANTIAGO_BBOX}&` +
        `types=address&` +
        `language=es&` +
        `limit=5`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Error al buscar direccion');
      }

      const data: MapboxResponse = await response.json();

      if (data.features.length === 0) {
        setError('No se encontraron direcciones en Santiago');
        setResults([]);
      } else {
        setResults(data.features);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignorar errores de cancelacion
      }
      setError('Error al buscar direccion');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchAddress]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const parseFeature = useCallback((feature: MapboxFeature): DireccionData => {
    // Extraer comuna del context
    let comuna = '';
    if (feature.context) {
      const localityContext = feature.context.find(
        (c) => c.id.includes('locality') || c.id.includes('place')
      );
      if (localityContext) {
        comuna = localityContext.text;
      }
    }

    // Extraer calle y numero
    const calle = feature.text || '';
    let numero = feature.address || '';

    // Si no hay numero en address, intentar extraerlo del place_name
    if (!numero && feature.place_name) {
      // Ejemplo de place_name: "Av Providencia 1234, Providencia, Santiago, Chile"
      // Intentar extraer el primer número que aparezca después de la calle
      const match = feature.place_name.match(/^[^\d,]+\s+(\d+)/);
      if (match && match[1]) {
        numero = match[1];
      }
    }

    // Coordenadas: center es [lng, lat]
    const longitud = feature.center[0];
    const latitud = feature.center[1];

    return {
      calle,
      numero,
      comuna,
      latitud,
      longitud,
      direccionCompleta: feature.place_name,
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearResults,
    parseFeature,
  };
}
