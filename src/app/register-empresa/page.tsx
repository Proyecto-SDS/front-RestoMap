'use client';

import dynamic from 'next/dynamic';

const RegisterEmpresaScreen = dynamic(
  () => import('@/screens/auth/RegisterEmpresaScreen'),
  { ssr: false }
);

export default function RegisterEmpresaPage() {
  return <RegisterEmpresaScreen />;
}
