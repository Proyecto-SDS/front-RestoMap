'use client';

import { useEffect, useState } from 'react';

/**
 * Hook para detectar si el dispositivo es móvil o tablet
 * @param breakpoint Ancho máximo en px para considerar móvil (default: 768)
 * @returns true si es móvil/tablet, false si es desktop
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar en el cliente
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Verificar inicialmente
    checkIsMobile();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
