/**
 * Server actions for user management operations.
 * All functions run on the server and handle admin user operations securely.
 */

'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, requireAdmin, requireSuperAdmin } from '@/lib/auth/session'
import { userFilterSchema, userRoleUpdateSchema } from '@/lib/schemas/user'
import { inviteSchema } from '@/lib/schemas/auth'
import { randomBytes } from 'crypto'
import type { Database } from '@/types/database'

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export type AdminUserRow = Database['public']['Tables']['admin_users']['Row']

/**
 * Gets all admin users with filtering and pagination.
 * Only admins and super_admins can view the user list.
 */
export async function getUsers(
  filters: Partial<z.infer<typeof userFilterSchema>> = {}
) {
  await requireAdmin()

  const validFilters = userFilterSchema.parse(filters)
  const { search, page, pageSize } = validFilters

  const supabase = await createClient()

  // Build query - admin users table
  let query = supabase.from('admin_users').select('*', { count: 'exact' })

  // Search by email or full_name
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  // Sort by email, descending
  query = query.order('email', { ascending: false })

  // Pagination
  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return {
    users: data || [],
    totalCount: count || 0,
  }
}

/**
 * Gets a single admin user by ID.
 */
export async function getUser(userId: string): Promise<AdminUserRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    throw new Error('User not found')
  }

  return data
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
export async function inviteUser(
  formData: FormData
): Promise<ActionResult<{ email: string; role: string }>> {
  const { adminUser: currentUser } = await getSession()

  try {
    // 1. Verify current user is admin/super_admin
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

    // Generate a cryptographically secure temporary password
    const tempPassword = randomBytes(12).toString('base64')

    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (createError || !authData.user) {
      return {
        success: false,
        error: 'Failed to create user account. The email may already be registered.',
      }
    }

    // 4. Create admin_users record using admin client
    const { error: adminUserError } = await adminClient
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
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(authData.user.id)

      if (deleteError) {
        console.error(
          '[Auth] CRITICAL: Orphaned auth user — admin_users insert failed AND cleanup failed',
          {
            userId: authData.user.id,
            email: parsed.data.email,
            insertError: adminUserError.message,
            deleteError: deleteError.message,
          }
        )
        return {
          success: false,
          error: 'Failed to create admin user. Please contact a super admin to clean up the orphaned account.',
        }
      }

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

/**
 * Updates a user's role (Super Admin only).
 * Super Admin can promote/demote both admins and editors.
 */
export async function updateUserRole(
  input: unknown
): Promise<ActionResult<AdminUserRow>> {
  const session = await requireSuperAdmin()

  try {
    // 1. Validate input
    const parsed = userRoleUpdateSchema.safeParse(input)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    // 2. Prevent self-demotion
    if (parsed.data.userId === session.user.id && parsed.data.role !== 'super_admin') {
      return {
        success: false,
        error: 'You cannot demote yourself. Ask another super admin to change your role.',
      }
    }

    // 3. Update user role
    const adminClient = createAdminClient()

    const { data: user, error } = await adminClient
      .from('admin_users')
      .update({
        role: parsed.data.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.userId)
      .select('*')
      .single()

    if (error || !user) {
      return {
        success: false,
        error: 'Failed to update user role',
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('Update role error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Deactivates a user (Super Admin + Admin, with role restrictions).
 * Super Admin can deactivate anyone.
 * Admin can only deactivate editors.
 */
export async function deactivateUser(userId: string): Promise<ActionResult<AdminUserRow>> {
  const session = await requireAdmin()

  try {
    // 1. Prevent self-deactivation
    if (userId === session.user.id) {
      return {
        success: false,
        error: 'You cannot deactivate yourself.',
      }
    }

    // 2. Check permissions and fetch target user
    const adminClient = createAdminClient()

    const { data: targetUser, error: fetchError } = await adminClient
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !targetUser) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // 3. Role validation: Admins can only deactivate editors, super_admins can deactivate anyone
    if (session.adminUser.role === 'admin' && targetUser.role !== 'editor') {
      return {
        success: false,
        error: 'You can only deactivate editors. Contact a super admin to deactivate admins.',
      }
    }

    // 4. Deactivate user
    const { data: user, error } = await adminClient
      .from('admin_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single()

    if (error || !user) {
      return {
        success: false,
        error: 'Failed to deactivate user',
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('Deactivate user error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Reactivates a user (Super Admin only).
 */
export async function reactivateUser(userId: string): Promise<ActionResult<AdminUserRow>> {
  await requireSuperAdmin()

  try {
    const adminClient = createAdminClient()

    const { data: user, error } = await adminClient
      .from('admin_users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single()

    if (error || !user) {
      return {
        success: false,
        error: 'Failed to reactivate user',
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('Reactivate user error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}
