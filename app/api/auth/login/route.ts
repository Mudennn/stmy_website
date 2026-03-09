/**
 * Route handler for login API endpoint.
 * Handles authentication and returns JSON response.
 * Client-side form will call this endpoint and navigate on success.
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { loginSchema } from '@/lib/schemas/auth'
import { checkRateLimit, recordFailedAttempt } from '@/lib/security/rate-limit'
import { getClientIp } from '@/lib/security/get-client-ip'

export async function POST(request: Request) {
  // Timing oracle mitigation: measure request time to enforce constant-time response
  // Even though both auth failures return the same message, response time could leak
  // whether the email exists in Supabase Auth (fast) vs not (slow with admin check)
  const MIN_RESPONSE_MS = 400
  const requestStart = Date.now()

  try {
    const body = await request.json()

    // 1. Rate limit check by IP
    const headersList = await headers()
    const ip = getClientIp(headersList)

    const rateLimitOk = await checkRateLimit(ip, 'login', 5, 300)
    if (!rateLimitOk) {
      // Enforce minimum response time
      const elapsed = Date.now() - requestStart
      if (elapsed < MIN_RESPONSE_MS) {
        await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed))
      }
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again in a few minutes.' },
        { status: 429 }
      )
    }

    // 2. Validate input
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input'
      // Enforce minimum response time
      const elapsed = Date.now() - requestStart
      if (elapsed < MIN_RESPONSE_MS) {
        await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed))
      }
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      )
    }

    // 3. Authenticate with Supabase
    const supabase = await createClient()
    const { error: authError, data } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (authError || !data.user) {
      console.warn('[Auth] Login failed:', authError?.message)
      // Record this failed attempt for rate limiting (5 attempts in 300 seconds)
      await recordFailedAttempt(ip, 'login', 300)
      // Enforce minimum response time to prevent timing oracle enumeration
      const elapsed = Date.now() - requestStart
      if (elapsed < MIN_RESPONSE_MS) {
        await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed))
      }
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      )
    }

    // 4. Verify user is in admin_users table and is active
    const adminClient = createAdminClient()
    const { data: adminUser, error: adminError } = await adminClient
      .from('admin_users')
      .select('id, role, is_active')
      .eq('id', data.user.id)
      .single()

    if (adminError || !adminUser || !adminUser.is_active) {
      await supabase.auth.signOut()
      // Record this failed attempt for rate limiting (5 attempts in 300 seconds)
      await recordFailedAttempt(ip, 'login', 300)
      // Enforce minimum response time to prevent timing oracle enumeration
      const elapsed = Date.now() - requestStart
      if (elapsed < MIN_RESPONSE_MS) {
        await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed))
      }
      // Return same generic error message as auth failure to prevent user enumeration
      // (attacker cannot distinguish between "email not found" and "not an admin")
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      )
    }

    // 5. Success — cookies are automatically set by Supabase client in Route Handler
    // Enforce minimum response time to prevent timing oracle enumeration
    const elapsed = Date.now() - requestStart
    if (elapsed < MIN_RESPONSE_MS) {
      await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed))
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Auth] Unexpected error:', error)
    // Even on error, enforce minimum response time
    const elapsed = Date.now() - requestStart
    if (elapsed < MIN_RESPONSE_MS) {
      await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed))
    }
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
