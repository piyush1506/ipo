/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.pkctechs.in',
          },
        ],
        destination: 'https://pkctechs.in/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://api.pkctechs.in' : 'http://localhost:5000');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
