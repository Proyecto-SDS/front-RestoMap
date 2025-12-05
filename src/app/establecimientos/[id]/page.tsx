'use client';

import { useRedirectEmpleado } from '@/hooks/useRedirectEmpleado';
import dynamic from 'next/dynamic';

const EstablishmentDetail = dynamic(
  () => import('@/screens/EstablishmentDetail'),
  { ssr: false }
);

export default function EstablishmentPage() {
  // Redirigir empleados a su dashboard
  useRedirectEmpleado();

  return <EstablishmentDetail />;
}
