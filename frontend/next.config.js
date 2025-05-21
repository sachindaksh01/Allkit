/** @type {import('next').NextConfig} */
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
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/api/convert',
        destination: 'http://localhost:8000/tools/image/converter/convert'
      },
      {
        source: '/api/remove-background',
        destination: 'http://localhost:8000/tools/image/bgremover/remove-background'
      }
    ];
  },
}

module.exports = nextConfig 