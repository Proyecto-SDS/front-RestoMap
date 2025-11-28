import { NavHeader } from '@/components/layout/NavHeader';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReservaYa - Reservas de Restaurantes en Santiago',
  description:
    'Encuentra y reserva los mejores restaurantes, restobares y bares en Santiago, Chile.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.className} flex flex-col h-screen overflow-hidden`}
      >
        <Providers>
          <NavHeader />
          <main className="flex-1 overflow-y-auto pt-16">{children}</main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
