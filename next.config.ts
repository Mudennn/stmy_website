import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Security headers configuration
   * Protects against XSS, clickjacking, and other common web vulnerabilities
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent browsers from MIME-sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent page from being displayed in an iframe
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Control browser features and APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
