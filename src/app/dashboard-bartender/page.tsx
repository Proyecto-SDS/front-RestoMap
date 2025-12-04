'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardBartenderScreen from '../../screens/bartender/DashboardBartenderScreen';

export default function DashboardBartenderPage() {
  const router = useRouter();
  const { isLoggedIn, userType, empleado } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (empleado?.rol !== 'bartender') {
      router.replace('/');
    }
  }, [isLoggedIn, userType, empleado, router]);

  if (!isLoggedIn || userType !== 'empresa' || empleado?.rol !== 'bartender') {
    return null;
  }

  return <DashboardBartenderScreen />;
}
