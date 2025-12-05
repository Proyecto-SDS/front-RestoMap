'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardGerenteScreen from '../../screens/gerente/DashboardGerenteScreen';

export default function DashboardGerentePage() {
  const router = useRouter();
  const { isLoggedIn, userType, user, isLoading } = useAuth();

  // Roles válidos para acceder al dashboard de gerente
  const isGerenteRol = user?.rol === 'gerente' || user?.rol === 'admin';

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (!isGerenteRol) {
      router.replace('/');
    }
  }, [isLoggedIn, userType, isGerenteRol, router, isLoading]);

  if (isLoading || !isLoggedIn || userType !== 'empresa' || !isGerenteRol) {
    return null;
  }

  return <DashboardGerenteScreen />;
}
