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
};

export default nextConfig;