'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardCocineroScreen from '../../screens/cocinero/DashboardCocineroScreen';

export default function DashboardCocineroPage() {
  const router = useRouter();
  const { isLoggedIn, userType, empleado } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (empleado?.rol !== 'cocinero') {
      router.replace('/');
    }
  }, [isLoggedIn, userType, empleado, router]);

  if (!isLoggedIn || userType !== 'empresa' || empleado?.rol !== 'cocinero') {
    return null;
  }

  return <DashboardCocineroScreen />;
}
