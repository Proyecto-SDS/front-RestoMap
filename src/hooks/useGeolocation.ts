'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UserPosition {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  position: UserPosition | null;
  heading: number | null;
  accuracy: number | null;
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'error';
  error: string | null;
  isWatching: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { enableHighAccuracy, timeout, maximumAge } = options;

  const mergedOptions = useMemo(
    () => ({
      enableHighAccuracy:
        enableHighAccuracy ?? defaultOptions.enableHighAccuracy!,
      timeout: timeout ?? defaultOptions.timeout!,
      maximumAge: maximumAge ?? defaultOptions.maximumAge!,
    }),
    [enableHighAccuracy, timeout, maximumAge]
  );

  const [state, setState] = useState<GeolocationState>({
    position: null,
    heading: null,
    accuracy: null,
    status: 'idle',
    error: null,
    isWatching: false,
  });

  const watchIdRef = useRef<number | null>(null);

  // Verificar si la geolocalización está disponible
  const isSupported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  // Procesar posición obtenida
  const handleSuccess = useCallback((pos: globalThis.GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      position: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      },
      heading: pos.coords.heading ?? null,
      accuracy: pos.coords.accuracy ?? null,
      status: 'granted',
      error: null,
    }));
  }, []);

  // Manejar errores de geolocalización
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Error desconocido al obtener ubicación';
    let status: GeolocationState['status'] = 'error';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage =
          'Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador.';
        status = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Ubicación no disponible. Verifica tu conexión GPS.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
        break;
    }

    setState((prev) => ({
      ...prev,
      status,
      error: errorMessage,
    }));
  }, []);

  // Solicitar ubicación una sola vez
  const requestPosition = useCallback(() => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Geolocalización no soportada en este navegador.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: mergedOptions.enableHighAccuracy,
      timeout: mergedOptions.timeout,
      maximumAge: mergedOptions.maximumAge,
    });
  }, [isSupported, handleSuccess, handleError, mergedOptions]);

  // Iniciar seguimiento continuo
  const startWatching = useCallback(() => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Geolocalización no soportada en este navegador.',
      }));
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Ya está observando
    }

    setState((prev) => ({ ...prev, status: 'loading', isWatching: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge,
      }
    );
  }, [isSupported, handleSuccess, handleError, mergedOptions]);

  // Detener seguimiento continuo
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setState((prev) => ({ ...prev, isWatching: false }));
    }
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    isSupported,
    requestPosition,
    startWatching,
    stopWatching,
  };
}
