/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  serverExternalPackages: ['@electric-sql/pglite'],
  outputFileTracingExcludes: { '/*': ['./.data/**/*', './test-results/**/*', './.env*'] },
  experimental: { serverActions: { bodySizeLimit: '8mb' } },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'self'" },
      ],
    }]
  },
}

export default nextConfig
