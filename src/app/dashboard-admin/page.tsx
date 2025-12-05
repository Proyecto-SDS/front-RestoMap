'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardAdminScreen from '../../screens/admin/DashboardAdminScreen';

export default function DashboardAdminPage() {
  const router = useRouter();
  const { isLoggedIn, userType, user, isLoading } = useAuth();

  useEffect(() => {
    // No redirigir mientras se carga el estado de autenticación
    if (isLoading) return;

    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (user?.rol !== 'admin') {
      router.replace('/');
    }
  }, [isLoggedIn, userType, user, router, isLoading]);

  // Mostrar nada mientras carga o si no tiene permisos
  if (
    isLoading ||
    !isLoggedIn ||
    userType !== 'empresa' ||
    user?.rol !== 'admin'
  ) {
    return null;
  }

  return <DashboardAdminScreen />;
}
