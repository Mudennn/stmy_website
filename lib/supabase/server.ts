/**
 * Server-side Supabase client for server components, server actions, and route handlers.
 * Uses @supabase/ssr for cookie-based session management via Next.js.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for server-side operations.
 * Automatically manages authentication session via cookies.
 * Safe to use in Server Components, Server Actions, and Route Handlers.
 *
 * Note: Cookie setting can fail in Server Components but will work in Server Actions/Route Handlers.
 * The middleware refreshes the session on subsequent requests, so silent failures are acceptable.
 *
 * Throws descriptive error if required environment variables are missing.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error(
      '[Server Client] Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Cannot create Supabase client without Supabase URL.'
    )
  }

  if (!anonKey) {
    throw new Error(
      '[Server Client] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Cannot create Supabase client without anon key.'
    )
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            // Only ignore the expected Server Component error; log all other failures
            // In Route Handlers/Server Actions, cookies MUST be set successfully.
            // Any other error indicates a real authentication problem.
            if (!msg.includes('Cookies can only be modified')) {
              console.error('[Supabase] Unexpected cookie set error:', msg)
            }
          }
        },
      },
    }
  )
}
