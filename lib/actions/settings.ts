/**
 * Server actions for user settings operations.
 * Handles profile updates and password changes for the authenticated user.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { profileSchema, passwordSchema } from '@/lib/schemas/settings'

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * Updates the current user's profile (full_name).
 */
export async function updateProfile(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession()

  try {
    const parsed = profileSchema.safeParse({
      full_name: formData.get('full_name'),
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('admin_users')
      .update({
        full_name: parsed.data.full_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (error) {
      return { success: false, error: 'Failed to update profile' }
    }

    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

/**
 * Updates the current user's password.
 * No current password required — user is already authenticated via session.
 */
export async function updatePassword(
  formData: FormData
): Promise<ActionResult> {
  await getSession()

  try {
    const parsed = passwordSchema.safeParse({
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      return { success: false, error: 'Failed to update password. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Update password error:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
