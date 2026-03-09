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
          // Content Security Policy - restrictive policy for admin panel
          // Restricts resource sources; allows inline scripts needed for Next.js RSC hydration
          // TODO: Replace 'unsafe-inline' with per-request nonce for stricter XSS protection
          {
            key: 'Content-Security-Policy',
            value: (() => {
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
              return [
                "default-src 'self'", // Only allow resources from same origin
                "script-src 'self' 'unsafe-inline'", // Allow inline scripts for Next.js RSC payload + client hydration
                "style-src 'self' 'unsafe-inline'", // Allow styles from self + inline (needed for styled-components/tailwind)
                "img-src 'self' data: https:", // Allow images from self, data URLs, and https
                "font-src 'self' data:", // Allow fonts from self and data URLs
                `connect-src 'self' ${supabaseUrl} ${supabaseUrl?.replace('https://', 'wss://')}`, // Allow Supabase API and WebSocket
                "frame-ancestors 'none'", // Prevent framing (supersedes X-Frame-Options)
                "base-uri 'self'", // Restrict base tag
                "form-action 'self'", // Restrict form submissions to same origin
              ].join('; ')
            })(),
          },
        ],
      },
    ]
  },
}

export default nextConfig
