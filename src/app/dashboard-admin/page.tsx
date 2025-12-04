'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardAdminScreen from '../../screens/admin/DashboardAdminScreen';

export default function DashboardAdminPage() {
  const router = useRouter();
  const { isLoggedIn, userType, empleado } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (empleado?.rol !== 'admin') {
      router.replace('/');
    }
  }, [isLoggedIn, userType, empleado, router]);

  if (!isLoggedIn || userType !== 'empresa' || empleado?.rol !== 'admin') {
    return null;
  }

  return <DashboardAdminScreen />;
}
