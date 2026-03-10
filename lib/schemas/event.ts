import { z } from 'zod'

/**
 * Event form data schema for create/edit operations.
 */
export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().max(5000).nullable().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  endDate: z.string().nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  locationUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
  lumaUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
  image: z.instanceof(File).optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  capacity: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string()).default([]),
})

export type EventFormData = z.infer<typeof eventSchema>

/**
 * Event filter and pagination schema for server-side queries.
 */
export const eventFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  sortBy: z.enum(['title', 'event_date', 'created_at']).default('event_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type EventFilter = z.infer<typeof eventFilterSchema>
