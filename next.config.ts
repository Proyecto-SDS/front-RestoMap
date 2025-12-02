import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // --- AGREGA ESTA LÍNEA ---
  output: 'standalone', 
  // -------------------------
  
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

};

export default nextConfig;