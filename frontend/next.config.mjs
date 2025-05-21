/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/convert',
        destination: 'http://localhost:8000/tools/image/converter/convert'
      },
      {
        source: '/api/remove-background',
        destination: 'http://localhost:8000/tools/image/bgremover/remove-background'
      }
    ];
  }
};

export default nextConfig; 