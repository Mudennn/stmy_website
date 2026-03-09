/**
 * Server-side rate limiting utility.
 * Uses the Supabase database function to track and limit attempts
 * by identifier (IP address or user ID) and action type.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Checks if an action is allowed based on rate limiting rules.
 * Returns true if the action is allowed, false if the rate limit is exceeded.
 *
 * @param identifier - IP address or user ID to track
 * @param action - Action type (e.g., 'login', 'api_call')
 * @param maxAttempts - Maximum attempts allowed (default: 10)
 * @param windowSeconds - Time window in seconds (default: 60)
 * @returns true if allowed, false if rate limit exceeded
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxAttempts: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
    })

    if (error) {
      console.error('[RateLimit] Check error:', error.message)
      // Fail open - if rate limit check itself fails, allow the action
      // The auth system has its own protections (password check, admin_users check)
      return true
    }

    return data as boolean
  } catch (err) {
    console.error('[RateLimit] Check failed:', err)
    // Fail open - don't block login if rate limiting is broken
    return true
  }
}
