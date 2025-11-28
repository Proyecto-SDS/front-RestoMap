'use client';

import dynamic from 'next/dynamic';

const LoginScreen = dynamic(
  () => import('@/screens/auth/LoginScreen'),
  { ssr: false }
);

export default function LoginPage() {
  return <LoginScreen />;
}
