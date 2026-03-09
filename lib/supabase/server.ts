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
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // In Server Components, cookie setting fails but that's okay — middleware will refresh on next request.
            // In Server Actions/Route Handlers, cookies should set successfully.
            if (process.env.NODE_ENV === 'development') {
              const msg = err instanceof Error ? err.message : String(err)
              if (msg.includes('Cookies can only be modified')) {
                // Expected in Server Components, skip logging
              } else {
                console.error('[Supabase] Cookie set error:', msg)
              }
            }
          }
        },
      },
    }
  )
}
