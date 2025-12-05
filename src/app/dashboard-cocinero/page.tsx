'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardCocineroScreen from '../../screens/cocinero/DashboardCocineroScreen';

export default function DashboardCocineroPage() {
  const router = useRouter();
  const { isLoggedIn, userType, user, isLoading } = useAuth();

  // Roles válidos para acceder al dashboard de cocinero
  const isCocineroRol = user?.rol === 'cocinero';

  useEffect(() => {
    // No redirigir mientras se carga el estado de autenticación
    if (isLoading) return;

    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (!isCocineroRol) {
      router.replace('/');
    }
  }, [isLoggedIn, userType, isCocineroRol, router, isLoading]);

  // Mostrar nada mientras carga o si no tiene permisos
  if (isLoading || !isLoggedIn || userType !== 'empresa' || !isCocineroRol) {
    return null;
  }

  return <DashboardCocineroScreen />;
}
