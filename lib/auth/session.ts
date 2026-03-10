/**
 * Server-side session helpers for authentication checks.
 * These functions are used in Server Components and Server Actions to get
 * the current user's session and verify their role.
 * All functions will redirect to /login if the user is not authenticated.
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'

/**
 * Type for the authenticated user session.
 */
export type AuthSession = {
  user: {
    id: string
    email: string
  }
  adminUser: Database['public']['Tables']['admin_users']['Row']
}

/**
 * Gets the current authenticated user session.
 * Throws/redirects if not authenticated or not in admin_users table.
 */
export async function getSession(): Promise<AuthSession> {
  const supabase = await createClient()

  // Get the authenticated user from Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get the user's admin profile using admin client
  // Consistent with login route: use service-role client to bypass RLS
  // This avoids potential issues with RLS policy changes affecting session establishment
  const adminClient = createAdminClient()
  const { data: adminUser, error } = await adminClient
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !adminUser || !adminUser.is_active) {
    // User exists in auth but not in admin_users table or is deactivated
    // Sign them out and redirect to login
    await supabase.auth.signOut()
    redirect('/login')
  }

  return {
    user: {
      id: user.id,
      email: user.email || '',
    },
    adminUser,
  }
}

/**
 * Requires the user to be an admin (super_admin or admin role).
 * Throws an error if the user is an editor or not authenticated.
 * Used in Server Actions that require admin access.
 * Returns the full session to avoid redundant getSession() calls.
 */
export async function requireAdmin(): Promise<AuthSession> {
  const session = await getSession()

  if (session.adminUser.role !== 'super_admin' && session.adminUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return session
}

/**
 * Requires the user to be a super_admin.
 * Throws an error if the user is an admin or editor.
 * Used in Server Actions that require super admin privileges.
 * Returns the full session to avoid redundant getSession() calls.
 */
export async function requireSuperAdmin(): Promise<AuthSession> {
  const session = await getSession()

  if (session.adminUser.role !== 'super_admin') {
    throw new Error('Forbidden: Super admin access required')
  }

  return session
}
