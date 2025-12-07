'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PedidoClienteScreen } from '../../screens/cliente/PedidoClienteScreen';

function PedidoContent() {
  const searchParams = useSearchParams();
  const qrCodigo = searchParams.get('qr');

  if (!qrCodigo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-8">
          <p className="text-[#64748B] text-lg">
            No se encontro codigo QR. Por favor escanea un QR valido.
          </p>
        </div>
      </div>
    );
  }

  return <PedidoClienteScreen qrCodigo={qrCodigo} />;
}

export default function PedidoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PedidoContent />
    </Suspense>
  );
}
