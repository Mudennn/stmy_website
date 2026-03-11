/**
 * Zod validation schemas for user management operations.
 * Used for invite and role update forms.
 */

import { z } from 'zod'

/**
 * Schema for inviting new admin users (Super Admin / Admin only).
 * Validates email, full name, and selected role.
 */
export const userInviteSchema = z.object({
  email: z.string().email('Invalid email format'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'editor']),
})

export type UserInviteFormData = z.infer<typeof userInviteSchema>

/**
 * Schema for updating a user's role (Super Admin only).
 * Super Admin can change any user's role to admin, editor, or super_admin.
 */
export const userRoleUpdateSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['super_admin', 'admin', 'editor']),
})

export type UserRoleUpdateFormData = z.infer<typeof userRoleUpdateSchema>

/**
 * Schema for filtering and paginating users.
 */
export const userFilterSchema = z.object({
  search: z.string().trim().default(''),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
})

export type UserFilterFormData = z.infer<typeof userFilterSchema>
