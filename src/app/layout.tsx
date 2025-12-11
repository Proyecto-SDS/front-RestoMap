'use client';

import { NavHeader } from '@/components/layout/NavHeader';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Hide header on auth pages and employee dashboards
  const hideHeader =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/dashboard-');

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="RestoMap" />
      </head>
      <body
        className={`${inter.className} flex flex-col h-screen overflow-hidden`}
      >
        <Providers>
          {!hideHeader && <NavHeader />}
          <main
            className={`flex-1 overflow-y-auto ${!hideHeader ? 'pt-16' : ''}`}
          >
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
