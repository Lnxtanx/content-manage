/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  experimental: {
    // Enable modern optimizations that are stable
    outputFileTracingRoot: undefined,
    optimizePackageImports: ['react-icons'],
    // Disable features that might cause build issues
    memoryBasedWorkersCount: true,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Cache control for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Connection optimization
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization
  images: {
    domains: [
      process.env.S3_BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com',
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60, // 1 minute minimum cache
  },
  
  // Add asset prefix for better caching control
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX : undefined,

  // Webpack configuration for production
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Add bundle analyzer in analyze mode
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true,
          })
        );
      }
      
      // Optimize bundle size
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 80000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the package name from the path
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 10,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 5,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    // Fix for CSS HMR issues
    if (dev) {
      // Use newer implementation for CSS modules in development
      const rules = config.module.rules
        .find((rule) => typeof rule.oneOf === 'object')
        ?.oneOf.filter((rule) => Array.isArray(rule.use));

      if (rules) {
        rules.forEach((rule) => {
          rule.use.forEach((moduleLoader) => {
            if (
              moduleLoader.loader?.includes('css-loader') &&
              !moduleLoader.loader?.includes('postcss-loader')
            ) {
              if (moduleLoader.options?.modules) {
                moduleLoader.options.modules.exportLocalsConvention = 'camelCase';
              }
            }
          });
        });
      }
    } else {
      // Production optimizations
      if (!config.optimization) {
        config.optimization = {};
      }
      
      // Enable module concatenation
      config.optimization.concatenateModules = true;
      
      // Remove console in production
      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        })
      );
    }
    
    return config;
  },

  // Compression
  compress: true,

  // Powered by header
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Optimize page loading
  swcMinify: true,
  
  // Automatically refresh on errors
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig; 