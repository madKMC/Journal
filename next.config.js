/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  swcMinify: false,
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
};

module.exports = nextConfig;