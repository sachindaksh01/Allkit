/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: '/api/convert',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/tools/image/converter/convert`
      },
      {
        source: '/api/remove-background',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/tools/image/bgremover/remove-background`
      },
      {
        source: '/api/pdf/from/word',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/from/word`,
      },
      {
        source: '/api/pdf/from/excel',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/from/excel`,
      },
      {
        source: '/api/pdf/from/powerpoint',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/from/powerpoint`,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      }

      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      }

      // Obfuscation only if OBFUSCATE env is true
      if (process.env.OBFUSCATE === 'true') {
        const JavaScriptObfuscator = require('webpack-obfuscator');
        config.plugins.push(
          new JavaScriptObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.5,
            identifierNamesGenerator: 'hexadecimal',
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: true,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: false,
            transformObjectKeys: true,
            unicodeEscapeSequence: false
          })
        );
      }
    }
    return config;
  }
}

module.exports = withBundleAnalyzer(nextConfig) 