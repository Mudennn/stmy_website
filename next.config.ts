import type { NextConfig } from 'next'

// Build-time assertion: ensure Supabase URL is available for CSP configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) {
  console.warn(
    '[next.config] NEXT_PUBLIC_SUPABASE_URL is not set at build time — ' +
    'CSP connect-src will not include the Supabase origin, breaking client-side API calls.'
  )
}

const nextConfig: NextConfig = {
  /**
   * Image optimization configuration
   * Allows next/image to serve images from Supabase storage buckets
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

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
          // Strict Transport Security - enforce HTTPS to prevent protocol downgrade attacks
          // max-age: 1 year (31536000 seconds), includeSubDomains applies HSTS to subdomains
          // Prevents browsers from ever accessing the site over HTTP after first secure visit
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy - restrictive policy for admin panel
          // Restricts resource sources; allows inline scripts needed for Next.js RSC hydration
          // TODO: Replace 'unsafe-inline' with per-request nonce for stricter XSS protection
          {
            key: 'Content-Security-Policy',
            value: (() => {
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
              // Convert HTTP/HTTPS URLs to WS/WSS for WebSocket connections
              const supabaseWsUrl = supabaseUrl
                ? supabaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://')
                : ''
              return [
                "default-src 'self'", // Only allow resources from same origin
                "script-src 'self' 'unsafe-inline'", // Allow inline scripts for Next.js RSC payload + client hydration
                "style-src 'self' 'unsafe-inline'", // Allow styles from self + inline (needed for styled-components/tailwind)
                "img-src 'self' data: https:", // Allow images from self, data URLs, and https
                "font-src 'self' data:", // Allow fonts from self and data URLs
                `connect-src 'self' ${supabaseUrl} ${supabaseWsUrl}`.trim(), // Allow Supabase API and WebSocket (handles http/https → ws/wss)
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
