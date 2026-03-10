/**
 * HTML sanitization utilities to prevent XSS attacks.
 * Uses DOMPurify (allowlist-based) for robust HTML cleaning.
 *
 * SECURITY NOTE: Regex-based blocklists are bypassable via:
 * - Malformed tags: <scr<script>ipt>payload</scr</script>ipt>
 * - Attribute obfuscation: <img onerror\t=alert(1)> (tab whitespace)
 * - Encoding: <IMG SRC="jav&#x0A;ascript:alert(1);">
 * - CSS expressions and browser quirks
 *
 * DOMPurify uses an allowlist approach, which is much more secure.
 */

import DOMPurify from 'isomorphic-dompurify'

// Register hook once at module load to prevent accumulation across invocations
// Prevents reverse tabnapping attacks where the opened page can redirect the opener tab
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/**
 * Sanitizes HTML input to remove dangerous tags and attributes.
 * Uses DOMPurify allowlist for robust XSS prevention.
 * Safe for storing user-generated content that should support basic HTML.
 *
 * @param input - Raw HTML string to sanitize
 * @returns Cleaned HTML string safe to render
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    KEEP_CONTENT: true,
  })
}

/**
 * Escapes HTML entities to prevent XSS.
 * Safe for plain text that should NOT support HTML tags.
 * Used for user input that will be displayed as plain text.
 *
 * @param input - Plain text string to escape
 * @returns HTML-escaped string safe to render
 */
export function escapeHtml(input: string): string {
  if (!input) return ''

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/**
 * Sanitizes plain text by removing any HTML tags.
 * Used for fields that should only contain plain text.
 *
 * @param input - Text that might contain HTML
 * @returns Plain text with all HTML stripped
 */
export function stripHtml(input: string): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Sanitizes URL to prevent javascript: protocol and other malicious URLs.
 * Returns empty string if URL is invalid or malicious.
 *
 * WARNING: This function allows ANY https: URL, including external domains.
 * An attacker can craft content with links to phishing sites. Use allowedDomains
 * parameter to restrict to trusted domains if the URL comes from user input.
 *
 * @param url - URL string to validate
 * @param allowedDomains - Optional array of trusted domains (e.g., ['example.com', 'www.example.com'])
 *                         If provided, external URLs to unlisted domains are rejected.
 *                         Always allows same-origin (relative) URLs.
 * @returns Safe URL or empty string
 */
export function sanitizeUrl(url: string, allowedDomains?: string[]): string {
  if (!url) return ''

  try {
    const parsed = new URL(url)

    // Only allow http and https protocols (reject javascript:, data:, vbscript:, etc.)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }

    // If domain allowlist provided, validate against it
    if (allowedDomains && allowedDomains.length > 0) {
      const hostname = parsed.hostname?.toLowerCase()
      if (!hostname || !allowedDomains.some(domain => hostname === domain.toLowerCase())) {
        return ''
      }
    }

    return url
  } catch {
    // Invalid URL
    return ''
  }
}

/**
 * Sanitizes a same-origin URL (relative or absolute on current domain).
 * Useful for internal navigation where you want to prevent redirects to external sites.
 * Returns empty string if URL points to a different domain.
 *
 * @param url - URL string to validate
 * @param currentDomain - Current site's domain (e.g., 'example.com')
 * @returns Safe same-origin URL or empty string
 */
export function sanitizeSameOriginUrl(url: string, currentDomain: string): string {
  if (!url) return ''

  // Allow relative URLs (same-origin by definition)
  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
    return url
  }

  // For absolute URLs, validate domain matches
  return sanitizeUrl(url, [currentDomain])
}
