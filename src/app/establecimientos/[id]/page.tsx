'use client';

import dynamic from 'next/dynamic';

const EstablishmentDetail = dynamic(
  () => import('@/screens/EstablishmentDetail'),
  { ssr: false }
);

export default function EstablishmentPage() {
  return <EstablishmentDetail />;
}
