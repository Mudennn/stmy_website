/**
 * Securely extract client IP address from request headers.
 *
 * SECURITY NOTE: x-forwarded-for is a non-standard header set by reverse proxies
 * and can be spoofed if not properly validated.
 *
 * Strategy (in order of preference):
 * 1. Use Vercel-specific header (CF-Connecting-IP) - guaranteed by Vercel edge
 * 2. Use the RIGHTMOST IP in x-forwarded-for (most recent hop from reverse proxy)
 * 3. Fall back to x-real-ip
 * 4. Return 'unknown' if none available
 *
 * IMPORTANT: This assumes you are deployed behind a trusted reverse proxy
 * (Vercel, Nginx, AWS ALB, etc.) that appends its own IP to x-forwarded-for.
 * If accessing the server directly without a reverse proxy, any IP can be spoofed.
 */

interface HeadersLike {
  get(name: string): string | null
}

export function getClientIp(headers: HeadersLike): string {
  // 1. Try Vercel's guaranteed header first (set at Vercel edge)
  const vercelIp = headers.get('cf-connecting-ip')
  if (vercelIp && isValidIp(vercelIp)) {
    return vercelIp
  }

  // 2. Try x-forwarded-for and extract RIGHTMOST IP
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

  // 3. Fall back to x-real-ip
  const xRealIp = headers.get('x-real-ip')
  if (xRealIp && isValidIp(xRealIp)) {
    return xRealIp
  }

  // 4. Return unknown
  return 'unknown'
}

/**
 * Validate that a string looks like a valid IP address (IPv4 or IPv6)
 */
function isValidIp(ip: string): boolean {
  // IPv4: basic check
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (ipv4Regex.test(ip)) {
    return true
  }

  // IPv6: basic check (simplified)
  if (ip.includes(':')) {
    return true
  }

  return false
}
