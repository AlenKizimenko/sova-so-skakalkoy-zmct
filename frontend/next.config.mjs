/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const extractor = process.env.EXTRACTOR_URL || 'http://extractor:8000'
    const composer = process.env.COMPOSER_URL || 'http://page-composer:8000'
    return [
      { source: '/api/extractor/:path*', destination: `${extractor}/:path*` },
      { source: '/api/composer/:path*', destination: `${composer}/:path*` },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
