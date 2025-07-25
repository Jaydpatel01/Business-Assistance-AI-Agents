/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Basic image configuration
  images: {
    domains: ['placeholder.svg', 'via.placeholder.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Basic settings
  poweredByHeader: false,
  compress: true,
  // Exclude test/development files from production builds
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  async rewrites() {
    return process.env.NODE_ENV === 'production' 
      ? [
          // Exclude test routes in production
          {
            source: '/test/:path*',
            destination: '/404',
          },
        ]
      : []
  },
};

export default nextConfig;
