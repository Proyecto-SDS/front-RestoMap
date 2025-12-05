'use client';

import { useRedirectEmpleado } from '@/hooks/useRedirectEmpleado';
import dynamic from 'next/dynamic';

// Import MapScreen dynamically with SSR disabled to avoid window/document errors
const MapScreen = dynamic(() => import('@/screens/MapScreen'), { ssr: false });

export default function HomePage() {
  // Redirigir empleados a su dashboard
  useRedirectEmpleado();

  return <MapScreen />;
}
