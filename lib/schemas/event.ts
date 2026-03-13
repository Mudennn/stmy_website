import { z } from 'zod'

/**
 * Event form data schema for create/edit operations.
 */
export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Event date must be in format YYYY-MM-DDTHH:MM'),
  location: z.string().max(255).nullable().optional(),
  lumaUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'Image must be 5 MB or smaller'
    )
    .optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
})

export type EventFormData = z.infer<typeof eventSchema>

/**
 * Event update schema - partial fields for partial updates.
 */
export const eventUpdateSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Event date must be in format YYYY-MM-DDTHH:MM'),
    location: z.string().max(255).nullable().optional(),
    lumaUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
    image: z
      .instanceof(File)
      .refine(
        (file) => file.size <= 5 * 1024 * 1024,
        'Image must be 5 MB or smaller'
      )
      .optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  })
  .partial()

export type EventUpdateData = z.infer<typeof eventUpdateSchema>

/**
 * Event filter and pagination schema for server-side queries.
 */
export const eventFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(['title', 'event_date', 'created_at']).default('event_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type EventFilter = z.infer<typeof eventFilterSchema>
