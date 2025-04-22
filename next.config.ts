/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
  },
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // Игнорировать ошибки ESLint во время сборки
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорировать ошибки TypeScript во время сборки
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
