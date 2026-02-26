/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para assets estáticos
  assetPrefix: '',
  generateBuildId: async () => {
    return 'build'
  },
  // Forzar que los archivos estáticos se sirvan desde la raíz
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

export default nextConfig;
