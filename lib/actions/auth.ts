/**
 * Server actions for authentication operations.
 * All functions run on the server and handle Supabase auth operations securely.
 */

'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { loginSchema, inviteSchema } from '@/lib/schemas/auth'
import { checkRateLimit } from '@/lib/security/rate-limit'

/**
 * Type for standardized action responses
 */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * Type for invite user response data
 */
export type InviteUserData = {
  email: string
  role: 'admin' | 'editor'
}

/**
 * Handles admin login.
 * Authenticates the user and sets session cookies, then returns success/error.
 * Client-side handles navigation to dashboard.
 *
 * 1. Rate limits by IP (5 attempts per 5 minutes)
 * 2. Validates email/password format
 * 3. Authenticates with Supabase Auth
 * 4. Verifies user exists in admin_users table and is active
 */
export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    // 1. Rate limit check by IP
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'

    const rateLimitOk = await checkRateLimit(ip, 'login', 5, 300) // 5 attempts per 5 minutes
    if (!rateLimitOk) {
      return {
        success: false,
        error: 'Too many login attempts. Please try again in a few minutes.',
      }
    }

    // 2. Validate input with Zod
    const parsed = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    // 3. Authenticate with Supabase (this should set auth cookies)
    const supabase = await createClient()
    const { error: authError, data } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (authError || !data.user) {
      console.warn('[Auth] Login failed:', authError?.message)
      return { success: false, error: 'Invalid email or password.' }
    }

    // 4. Verify user is in admin_users table and is active
    // Use admin client (service role) to bypass RLS for this check
    const adminClient = createAdminClient()
    const { data: adminUser, error: adminError } = await adminClient
      .from('admin_users')
      .select('id, role, is_active')
      .eq('id', data.user.id)
      .single()

    if (adminError || !adminUser || !adminUser.is_active) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Access denied. This account is not authorized for admin access.',
      }
    }

    // 5. Success — cookies should be set by Supabase client
    return { success: true }
  } catch (error) {
    console.error('[Auth] Unexpected error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Handles admin logout.
 * Signs out the user and redirects to login page.
 */
export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * Invites a new admin user (Super Admin + Admin only).
 * Only Super Admin can invite other admins.
 * Admins can only invite editors.
 *
 * 1. Verifies current user is admin/super_admin
 * 2. Validates invite data
 * 3. Creates auth user via service role
 * 4. Creates admin_users record with specified role
 * 5. Returns success or error
 */
export async function inviteUserAction(
  formData: FormData
): Promise<ActionResult<InviteUserData>> {
  try {
    // 1. Verify current user is admin/super_admin
    const { adminUser: currentUser } = await getSession()

    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return {
        success: false,
        error: 'Insufficient permissions. Only admins can invite users.',
      }
    }

    // 2. Validate invite data
    const parsed = inviteSchema.safeParse({
      email: formData.get('email'),
      full_name: formData.get('full_name'),
      role: formData.get('role'),
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    // Role validation: Admins can only create editors, super_admins can create both
    if (currentUser.role === 'admin' && parsed.data.role === 'admin') {
      return {
        success: false,
        error: 'You can only invite editors. Contact a super admin to create admins.',
      }
    }

    // 3. Create auth user via service role client
    const adminClient = createAdminClient()

    // Generate a temporary password (user will reset on first login)
    const tempPassword = Math.random().toString(36).slice(-12)

    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since this is invite-only
    })

    if (createError || !authData.user) {
      return {
        success: false,
        error: createError?.message || 'Failed to create user account',
      }
    }

    // 4. Create admin_users record
    const supabase = await createClient()
    const { error: adminUserError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: parsed.data.email,
        full_name: parsed.data.full_name,
        role: parsed.data.role,
        is_active: true,
      })

    if (adminUserError) {
      // Clean up auth user if admin_users creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return {
        success: false,
        error: 'Failed to create admin user profile',
      }
    }

    // 5. Success
    return {
      success: true,
      data: {
        email: parsed.data.email,
        role: parsed.data.role,
      },
    }
  } catch (error) {
    console.error('Invite action error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}
