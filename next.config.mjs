/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // <-- ESTO ES CRUCIAL para Cloudflare Pages
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
