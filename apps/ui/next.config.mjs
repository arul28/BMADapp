/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default {
  output: 'export',
  trailingSlash: true,
  assetPrefix: './',
  ...nextConfig,
};
