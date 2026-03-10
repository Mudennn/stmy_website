import { z } from 'zod'

/**
 * Event form data schema for create/edit operations.
 */
export const eventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(5000).nullable().optional(),
    eventDate: z.string().min(1, 'Event date is required'),
    endDate: z.string().nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    locationUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
    lumaUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
    image: z
      .instanceof(File)
      .refine(
        (file) => file.size <= 5 * 1024 * 1024,
        'Image must be 5 MB or smaller'
      )
      .optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
    capacity: z.number().int().positive().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate && data.eventDate && data.endDate < data.eventDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after event date',
        path: ['endDate'],
      })
    }
  })

export type EventFormData = z.infer<typeof eventSchema>

/**
 * Event update schema - partial fields without refinements for partial updates.
 * The date constraint validation is handled in the action layer for partial updates.
 */
export const eventUpdateSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(5000).nullable().optional(),
    eventDate: z.string().min(1, 'Event date is required'),
    endDate: z.string().nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    locationUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
    lumaUrl: z.union([z.literal(''), z.string().url('Invalid URL')]).optional(),
    image: z
      .instanceof(File)
      .refine(
        (file) => file.size <= 5 * 1024 * 1024,
        'Image must be 5 MB or smaller'
      )
      .optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
    capacity: z.number().int().positive().nullable().optional(),
  })
  .partial()
  .superRefine((data, ctx) => {
    if (data.endDate && data.eventDate && data.endDate < data.eventDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after event date',
        path: ['endDate'],
      })
    }
  })

export type EventUpdateData = z.infer<typeof eventUpdateSchema>

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
