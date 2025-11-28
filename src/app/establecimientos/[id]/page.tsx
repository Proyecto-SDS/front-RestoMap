'use client';

import dynamic from 'next/dynamic';

const EstablishmentDetail = dynamic(
  () => import('@/screens/EstablishmentDetail'),
  { ssr: false }
);

export default function EstablishmentPage({ params }: { params: { id: string } }) {
  return <EstablishmentDetail />;
}
