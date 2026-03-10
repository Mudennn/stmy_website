import { z } from 'zod'

/**
 * Member form data schema for create/edit operations.
 */
export const memberSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  roleTitle: z.string().max(255).nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  bio: z.string().max(5000).nullable().optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be 5 MB or smaller')
    .optional(),
  twitterUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
  skillTags: z.string().optional(), // comma-separated, converted to array in action
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type MemberFormData = z.infer<typeof memberSchema>

/**
 * Member filter and pagination schema for server-side queries.
 */
export const memberFilterSchema = z.object({
  search: z.string().optional(),
  isFeatured: z.enum(['true', 'false']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  sortBy: z.enum(['full_name', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type MemberFilter = z.infer<typeof memberFilterSchema>
