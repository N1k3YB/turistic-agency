/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // forceSwcTransforms: true, // Удаляем это поле, чтобы Turbopack мог работать
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Исключаем системную папку Application Data из сканирования
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
        '**/Application Data/**',
        '**/AppData/**',
      ]
    };
    return config;
  }
};

export default nextConfig;
