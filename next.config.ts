import type { NextConfig } from 'next';
import withPWAInit from 'next-pwa';
import path from 'path';

// Configuración PWA - deshabilitada en desarrollo
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  output: 'standalone',
};

export default withPWA(nextConfig);
