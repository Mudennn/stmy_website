import { z } from 'zod'

/**
 * CMS content form data schema for edit operations.
 * Sections are pre-seeded — admins edit only, no create/delete.
 */
export const contentSchema = z.object({
  title: z.string().max(255).nullable().optional(),
  subtitle: z.string().max(500).nullable().optional(),
  body: z.string().max(50000).nullable().optional(),
  metadata: z.string().nullable().optional(), // JSON string, parsed in action
  sortOrder: z.number().int().min(0).nullable().optional(),
  isPublished: z.boolean().default(false),
})

export type ContentFormData = z.infer<typeof contentSchema>

/**
 * Content filter and pagination schema for server-side queries.
 */
export const contentFilterSchema = z.object({
  section: z
    .enum([
      'hero',
      'mission',
      'stats',
      'events_section',
      'members_spotlight',
      'partners_ecosystem',
      'community_wall',
      'faq',
      'join_cta',
      'footer',
    ])
    .optional(),
  isPublished: z.enum(['true', 'false']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(['section', 'sort_order', 'updated_at']).default('sort_order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ContentFilter = z.infer<typeof contentFilterSchema>
