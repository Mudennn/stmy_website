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
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
