/**
 * Server actions for authentication operations.
 * All functions run on the server and handle Supabase auth operations securely.
 */

'use server'

import { randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { inviteSchema } from '@/lib/schemas/auth'

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
 * IMPORTANT: Requires SMTP to be configured in Supabase before production use.
 * See docs/AUTH_IMPLEMENTATION.md#email--invitations for setup instructions.
 *
 * Currently creates auth user but cannot send invitation emails without SMTP.
 * TODO: Update to use inviteUserByEmail() once SMTP is configured.
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

    // Generate a cryptographically secure temporary password (user will reset on first login)
    const tempPassword = randomBytes(12).toString('base64')

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
