/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.CI ? "standalone" : undefined,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
