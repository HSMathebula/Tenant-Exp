/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  sassOptions: {
    includePaths: ['./styles'],
  },
  experimental: {
    serverActions: true,
  },
}

export default nextConfig
