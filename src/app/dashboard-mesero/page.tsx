'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardMeseroScreen from '../../screens/mesero/DashboardMeseroScreen';

export default function DashboardMeseroPage() {
  const router = useRouter();
  const { isLoggedIn, userType, empleado } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (empleado?.rol !== 'mesero') {
      router.replace('/');
    }
  }, [isLoggedIn, userType, empleado, router]);

  if (!isLoggedIn || userType !== 'empresa' || empleado?.rol !== 'mesero') {
    return null;
  }

  return <DashboardMeseroScreen />;
}
