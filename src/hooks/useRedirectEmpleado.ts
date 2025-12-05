'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para redirigir automáticamente a empleados a su dashboard
 * Usar en páginas que solo deben ser accesibles para personas (usuarios normales)
 *
 * Ejemplo de uso:
 * ```tsx
 * export default function HomePage() {
 *   useRedirectEmpleado();
 *   // ... resto del componente
 * }
 * ```
 */
export function useRedirectEmpleado() {
  const router = useRouter();
  const { userType, user, isLoading } = useAuth();

  useEffect(() => {
    // No redirigir mientras carga
    if (isLoading) return;

    // Si es empleado (tiene id_local), redirigir a su dashboard
    if (userType === 'empresa' && user?.id_local) {
      const userRol = user.rol?.toLowerCase() || 'mesero';

      // Mapear rol a dashboard correspondiente
      const rolToDashboard: Record<string, string> = {
        admin: '/dashboard-gerente',
        gerente: '/dashboard-gerente',
        mesero: '/dashboard-mesero',
        cocinero: '/dashboard-cocinero',
        bartender: '/dashboard-bartender',
      };

      const dashboardPath = rolToDashboard[userRol] || '/dashboard-mesero';

      router.replace(dashboardPath);
    }
  }, [userType, user, isLoading, router]);
}
