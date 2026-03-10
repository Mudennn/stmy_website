/**
 * Admin Supabase client using service role key for privileged operations.
 * ⚠️  SECURITY: This client uses SUPABASE_SERVICE_ROLE_KEY.
 * MUST ONLY be used server-side. Never expose to client.
 * Used only for: creating invited users, admin operations beyond RLS.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase admin client with service role privileges.
 * ⚠️  DO NOT call this in Client Components or expose to browser.
 * Only use in Server Actions, Route Handlers, and server-side utilities.
 *
 * Throws an error if required environment variables are missing.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      '[Admin Client] Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Cannot create Supabase admin client without Supabase URL.'
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      '[Admin Client] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'Cannot create Supabase admin client without service role key. ' +
      'Ensure this secret is configured in your deployment environment.'
    )
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
