'use client';

import { AuthProvider } from '@/context/AuthContext';
import { NotificacionesProvider } from '@/context/NotificacionesContext';
import { SocketProvider } from '@/context/SocketContext';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SocketProvider>
        <AuthProvider>
          <NotificacionesProvider>{children}</NotificacionesProvider>
        </AuthProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}
