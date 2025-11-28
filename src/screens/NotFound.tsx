'use client';

import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { PrimaryButton } from '../components/buttons/PrimaryButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-full opacity-20 flex items-center justify-center">
            <span className="text-6xl">404</span>
          </div>
        </div>

        {/* Title and message */}
        <h1 className="text-[#334155] mb-4">Página no encontrada</h1>
        <p className="text-[#64748B] mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <PrimaryButton size="lg" className="w-full sm:w-auto">
              <Home size={20} />
              Volver al inicio
            </PrimaryButton>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-transparent border-2 border-[#E2E8F0] text-[#334155] rounded-xl transition-all duration-200 hover:bg-[#F1F5F9]"
          >
            <ArrowLeft size={20} />
            Página anterior
          </button>
        </div>

        {/* Additional help */}
        <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
          <p className="text-sm text-[#64748B]">
            ¿Necesitas ayuda?{' '}
            <Link href="/" className="text-[#F97316] hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
