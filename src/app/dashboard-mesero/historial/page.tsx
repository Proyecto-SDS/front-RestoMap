'use client';

import HistorialPedidos from '@/components/gerente/HistorialPedidos';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HistorialMeseroPage() {
  const router = useRouter();
  const { isLoggedIn, userType, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn || userType !== 'empresa') {
      router.replace('/login');
      return;
    }

    if (user?.rol !== 'mesero') {
      router.replace('/');
    }
  }, [isLoggedIn, userType, user, router, isLoading]);

  if (
    isLoading ||
    !isLoggedIn ||
    userType !== 'empresa' ||
    user?.rol !== 'mesero'
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard-mesero')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Historial de Pedidos
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HistorialPedidos />
      </div>
    </div>
  );
}
