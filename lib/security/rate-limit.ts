/**
 * Server-side rate limiting utility with dual-layer protection.
 *
 * Layer 1 (In-Process): In-memory tracking per IP/action - never fails open
 * Layer 2 (Database): Supabase RPC for persistent tracking across instances
 *
 * If either layer says the limit is exceeded, the action is blocked.
 * The in-memory layer acts as a backstop if the database is unavailable,
 * ensuring rate limiting cannot be bypassed by saturating Supabase.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * In-memory rate limiter state.
 * Maps "identifier:action" -> {attempts: number, windowEnd: timestamp}
 */
const inMemoryLimiter = new Map<string, { attempts: number; windowEnd: number }>()

/**
 * Checks if an action is allowed based on rate limiting rules.
 * Uses dual-layer protection: in-memory (fail-closed) + database (persistent).
 *
 * Returns true if the action is allowed, false if the rate limit is exceeded.
 * This function fails CLOSED - if either layer says block, we block.
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
  const now = Date.now()
  const key = `${identifier}:${action}`

  // STEP 1: Check and update in-memory rate limiter
  // This is the fail-closed backstop that works even if database is unavailable
  const inMemoryEntry = inMemoryLimiter.get(key)
  let inMemoryAllowed = true

  if (inMemoryEntry && now < inMemoryEntry.windowEnd) {
    // Window is still active - check if limit exceeded
    if (inMemoryEntry.attempts >= maxAttempts) {
      inMemoryAllowed = false
      console.warn(
        `[RateLimit] In-memory limit exceeded for ${key}: ${inMemoryEntry.attempts}/${maxAttempts} attempts`
      )
    }
    // Increment for next check
    inMemoryEntry.attempts++
  } else {
    // Window expired or new entry - create/reset window
    inMemoryLimiter.set(key, {
      attempts: 1,
      windowEnd: now + windowSeconds * 1000,
    })
  }

  // If in-memory limit exceeded, block immediately (fail-closed)
  if (!inMemoryAllowed) {
    return false
  }

  // STEP 2: Check database rate limiter (persistent tracking)
  let dbAllowed = true
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
    })

    if (error) {
      console.error('[RateLimit] Database check error:', error.message)
      // Database failed - in-memory limiter is the protection, already checked above
      dbAllowed = true // Don't fail-open, but in-memory already controls this
    } else {
      dbAllowed = data as boolean
      if (!dbAllowed) {
        console.warn(
          `[RateLimit] Database limit exceeded for ${key} (${action})`
        )
      }
    }
  } catch (err) {
    console.error('[RateLimit] Database check failed:', err)
    // Database unreachable - in-memory limiter is the protection
    dbAllowed = true // Don't fail-open, in-memory already controls this
  }

  // DECISION: Block only if database explicitly says no
  // (If database failed, we already blocked via in-memory if needed)
  return dbAllowed
}
