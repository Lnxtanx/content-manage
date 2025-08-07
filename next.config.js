/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  experimental: {
    // Enable modern optimizations that are stable
    outputFileTracingRoot: undefined,
    optimizePackageImports: ['react-icons'],
    // Disable features that might cause build issues
    memoryBasedWorkersCount: true,
    // Body size limit set to 10MB to match AWS defaults
    serverComponentsExternalPackages: ['sharp'],
  },
  
  // API route body parser configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set body parser limit to 10MB to match AWS defaults
    },
    responseLimit: '10mb',
  },
  
  // Production-specific security headers
  async headers() {
    const securityHeaders = [
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
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    // Production-specific headers
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/((?!api/).*)',
          headers: [
            ...securityHeaders,
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/api/(.*)',
          headers: [
            ...securityHeaders,
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
          ],
        },
      ];
    }

    // Development headers
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Production environment variables available to the client
  env: {
    APP_VERSION: process.env.npm_package_version || '1.0.0',
    BUILD_TIME: new Date().toISOString(),
  },

  // Production image optimization
  images: {
    domains: [
      process.env.S3_BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com',
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false, // Disable SVG for security
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 3600, // 1 hour cache for production
  },
  
  // Production asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX : undefined,

  // Webpack configuration for production
  webpack: (config, { isServer, dev }) => {
    // Fix for module loading issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Add cache configuration to prevent chunk loading issues
    config.cache = {
      type: 'filesystem',
      compression: false,
      buildDependencies: {
        config: [__filename],
      },
    };

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            defaultVendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            vendor: {
              name: (module) => {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1] || '';
                return `vendor-${packageName.replace('@', '')}`;
              },
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    // Production minification
    if (!dev) {
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: process.env.NODE_ENV === 'production',
              drop_debugger: true,
              pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
            },
            mangle: true,
            safari10: true,
          },
          parallel: true,
        })
      );
    }
    
    return config;
  },

  // Production settings
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Production redirects for security
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: true,
      },
      {
        source: '/phpMyAdmin',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-admin',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 