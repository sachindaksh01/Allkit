/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/convert',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/tools/image/converter/convert`
      },
      {
        source: '/api/remove-background',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/tools/image/bgremover/remove-background`
      }
    ];
  }
};

export default nextConfig; 