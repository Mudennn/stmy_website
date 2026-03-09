/**
 * Securely extract client IP address from request headers.
 *
 * SECURITY NOTE: x-forwarded-for is a non-standard header set by reverse proxies
 * and can be spoofed if not properly validated.
 *
 * Strategy (in order of preference):
 * 1. Use Cloudflare's header (CF-Connecting-IP) - true client IP at Cloudflare edge
 * 2. Use x-real-ip - set by Vercel and most reverse proxies to true client IP
 * 3. Use the RIGHTMOST IP in x-forwarded-for (most recent hop from reverse proxy)
 * 4. Return 'unknown' if none available
 *
 * IMPORTANT: This assumes you are deployed behind a trusted reverse proxy
 * (Vercel, Cloudflare, Nginx, AWS ALB, etc.) that sets these headers securely.
 * If accessing the server directly without a reverse proxy, any IP can be spoofed.
 */

import { isIPv4, isIPv6 } from 'net'

interface HeadersLike {
  get(name: string): string | null
}

export function getClientIp(headers: HeadersLike): string {
  // 1. Try Cloudflare's header first (true client IP at Cloudflare edge)
  const cloudflareIp = headers.get('cf-connecting-ip')
  if (cloudflareIp && isValidIp(cloudflareIp)) {
    return cloudflareIp
  }

  // 2. Try x-real-ip (set by Vercel and most reverse proxies to true client IP)
  const xRealIp = headers.get('x-real-ip')
  if (xRealIp && isValidIp(xRealIp)) {
    return xRealIp
  }

  // 3. Try x-forwarded-for and extract RIGHTMOST IP
  // Format: "client, proxy1, proxy2" where rightmost is the proxy we trust
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const ips = xForwardedFor
      .split(',')
      .map((ip) => ip.trim())
      .filter(isValidIp)

    // Use the rightmost (most recent) IP, which should be from our reverse proxy
    if (ips.length > 0) {
      return ips[ips.length - 1]
    }
  }

  // 4. Return unknown
  return 'unknown'
}

/**
 * Validate that a string looks like a valid IP address (IPv4 or IPv6)
 * Uses Node's net module for robust validation including IPv4-mapped IPv6 addresses
 */
function isValidIp(ip: string): boolean {
  return isIPv4(ip) || isIPv6(ip)
}
