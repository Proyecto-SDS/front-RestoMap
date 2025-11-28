'use client';

import ProtectedRoute from '@/components/routing/ProtectedRoute';
import dynamic from 'next/dynamic';

const ProfileScreen = dynamic(() => import('@/screens/auth/ProfileScreen'), {
  ssr: false,
});

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileScreen />
    </ProtectedRoute>
  );
}
