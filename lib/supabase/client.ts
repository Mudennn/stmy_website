/**
 * Browser-side Supabase client for Client Components.
 * Used for real-time subscriptions and client-side data fetching.
 * Only accessible in components with 'use client' directive.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for browser-side operations.
 * Cached per module to reuse the same instance.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
