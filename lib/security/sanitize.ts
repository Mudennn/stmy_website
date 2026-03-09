/**
 * HTML sanitization utilities to prevent XSS attacks.
 * Uses regex-based sanitization for safe HTML cleaning.
 */

/**
 * Sanitizes HTML input to remove dangerous tags and attributes.
 * Strips script tags, event handlers, and javascript: protocol.
 * Safe for storing user-generated content that should support basic HTML.
 *
 * @param input - Raw HTML string to sanitize
 * @returns Cleaned HTML string safe to render
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''

  // Remove script tags and their content
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (on* attributes)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: protocol from href and src
  cleaned = cleaned.replace(/\s*(href|src)\s*=\s*["']?javascript:[^"'>]*/gi, '')

  // Remove style attribute content that might contain expressions
  cleaned = cleaned.replace(/\s*style\s*=\s*["']([^"']*(?:expression|behavior|javascript)[^"']*)["']/gi, '')

  // Remove iframe, object, embed tags
  cleaned = cleaned.replace(/<(iframe|object|embed|frame|frameset)[^>]*>/gi, '')

  return cleaned
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
 * @param url - URL string to validate
 * @returns Safe URL or empty string
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    return url
  } catch {
    // Invalid URL
    return ''
  }
}
