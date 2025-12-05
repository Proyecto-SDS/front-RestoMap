'use client';

import { useParams } from 'next/navigation';
import MesaDetailScreen from '../../../../screens/mesero/MesaDetailScreen';

export default function MesaDetailPage() {
  const params = useParams();
  const mesaId = params.id as string;

  return <MesaDetailScreen mesaId={mesaId} />;
}
