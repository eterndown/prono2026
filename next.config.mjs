const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  compress: true,
  turbopack: {},
  
  // Optimizaciones para StackBlitz
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  
  // Excluir carpetas pesadas del watch
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.git/**'],
    };
    return config;
  },
};

export default nextConfig;