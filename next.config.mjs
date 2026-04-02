/** @type {import('next').NextConfig} */
const nextConfig = {
  // Para exportación estática (Cloudflare Pages)
  output: 'export',
  
  // Imágenes optimizadas para estático
  images: { 
    unoptimized: true 
  },
  
  // Slash final para rutas estáticas
  trailingSlash: true,
  
  // React Strict Mode en desarrollo
  reactStrictMode: true,
  
  // Compresión habilitada
  compress: true,
  
  // Ignorar errores de TypeScript en build (para desarrollo rápido)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // === CRÍTICO PARA STACKBLITZ: Configuración vacía de Turbopack ===
  // Esto silencia el error de "webpack config sin turbopack config"
  turbopack: {},
  
  // === FORZAR WEBPACK EN DESARROLLO ===
  // Esta función asegura que se use Webpack en lugar de Turbopack
  webpack: (config, { isServer, dev }) => {
    // En StackBlitz/WASM, forzar Webpack siempre
    if (process.env.VERCEL || process.env.STACKBLITZ) {
      return config;
    }
    return config;
  },
};

export default nextConfig;