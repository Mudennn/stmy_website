import { z } from 'zod'

/**
 * Announcement form data schema for create/edit operations.
 * Date validation (endsAt > startsAt) is handled in the action layer.
 */
export const announcementSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000),
  isActive: z.boolean().default(false),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
})

export type AnnouncementFormData = z.infer<typeof announcementSchema>

/**
 * Announcement filter and pagination schema for server-side queries.
 */
export const announcementFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(['created_at', 'starts_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type AnnouncementFilter = z.infer<typeof announcementFilterSchema>
