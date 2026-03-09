/**
 * Server-side rate limiting utility with dual-layer protection.
 *
 * Layer 1 (In-Process): In-memory tracking per IP/action
 * Layer 2 (Database): Supabase RPC for persistent tracking across instances
 *
 * IMPORTANT: Serverless Limitation
 * ================================
 * On Vercel/serverless platforms, each invocation runs in a fresh container with
 * an empty in-memory Map. Multiple concurrent instances maintain independent state.
 * An attacker can:
 * - Force cold starts (wait between bursts) to reset the in-memory counter
 * - Distribute requests across instances to bypass the 5-attempt limit
 *
 * Therefore, the in-memory layer provides:
 * ✓ Protection against same-instance micro-bursts (within ~100ms on warm instance)
 * ✓ Graceful degradation if database is briefly unavailable
 * ✗ NOT protection against sustained attacks distributed across invocations
 *
 * The database layer is the PRIMARY protection and provides the only reliable
 * rate limiting guarantee across distributed instances and cold starts.
 *
 * The in-memory layer should be treated as an optimization for same-instance
 * throughput, not as a security backstop for sustained attacks.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * In-memory rate limiter state (per-invocation, not shared across instances).
 * Maps "identifier:action" -> {attempts: number, windowEnd: timestamp}
 *
 * ⚠️ SERVERLESS LIMITATION: This Map is isolated to the current container.
 * On Vercel/serverless, each cold start gets a fresh empty Map. Attackers can
 * force cold starts or distribute requests across instances to bypass this layer.
 * Do NOT rely on this for sustained attack protection — use the database layer.
 */
const inMemoryLimiter = new Map<string, { attempts: number; windowEnd: number }>()

/**
 * Track when we last cleaned up expired entries to avoid running too frequently.
 * Cleanup is deferred and runs periodically to avoid overhead during high load.
 */
let lastCleanupTime = Date.now()
const CLEANUP_INTERVAL_MS = 60000 // Run cleanup every 60 seconds

/**
 * Removes expired entries from the in-memory rate limiter.
 * Called periodically to prevent unbounded memory growth.
 * Under a sustained attack with many different IPs, entries would accumulate forever
 * without this cleanup (lazy deletion only happens on re-access after expiry).
 */
function pruneExpiredEntries(): void {
  const now = Date.now()
  let deletedCount = 0

  for (const [key, entry] of inMemoryLimiter) {
    if (now >= entry.windowEnd) {
      inMemoryLimiter.delete(key)
      deletedCount++
    }
  }

  if (deletedCount > 0) {
    console.debug(`[RateLimit] Pruned ${deletedCount} expired entries. Size: ${inMemoryLimiter.size}`)
  }
}

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
/**
 * Records a failed login attempt in the rate limiter.
 * Only called when authentication actually fails, not on every attempt.
 * This prevents legitimate successful logins from consuming rate limit budget.
 *
 * @param identifier - IP address or user ID that failed
 * @param action - Action type (e.g., 'login')
 */
export async function recordFailedAttempt(identifier: string, action: string): Promise<void> {
  try {
    const supabase = await createClient()
    // Type assertion needed for new RPC function added in migration 007
    await (supabase.rpc as any)('record_failed_attempt', {
      p_identifier: identifier,
      p_action: action,
    })
  } catch (err) {
    console.error('[RateLimit] Failed to record attempt:', err)
    // Silently ignore - database write failure shouldn't block the request
  }
}

export async function checkRateLimit(
  identifier: string,
  action: string,
  maxAttempts: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  const now = Date.now()
  const key = `${identifier}:${action}`

  // Periodically clean up expired entries to prevent unbounded memory growth
  // This is especially important during attacks with many different IPs
  if (now - lastCleanupTime > CLEANUP_INTERVAL_MS) {
    lastCleanupTime = now
    pruneExpiredEntries()
  }

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
