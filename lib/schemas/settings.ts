/**
 * Zod validation schemas for user settings operations.
 * Used for profile updates and password changes.
 */

import { z } from 'zod'

/**
 * Schema for updating user profile (name).
 */
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

/**
 * Schema for changing password.
 * Requires new password and confirmation to match.
 */
export const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PasswordFormData = z.infer<typeof passwordSchema>
