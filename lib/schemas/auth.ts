/**
 * Zod validation schemas for authentication operations.
 * Used for both client-side form validation and server-side input validation.
 */

import { z } from 'zod'

/**
 * Schema for admin login form.
 * Validates email and password format.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema for inviting new admin users (Super Admin / Admin only).
 * Validates email, full name, and selected role.
 */
export const inviteSchema = z.object({
  email: z.string().email('Invalid email format'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'editor']),
})

export type InviteFormData = z.infer<typeof inviteSchema>
