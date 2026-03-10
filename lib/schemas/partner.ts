import { z } from 'zod'

/**
 * Partner form data schema for create/edit operations.
 */
export const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  logo: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be 5 MB or smaller')
    .optional(),
  isActive: z.boolean().default(true),
})

export type PartnerFormData = z.infer<typeof partnerSchema>

/**
 * Partner filter and pagination schema for server-side queries.
 */
export const partnerFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  sortBy: z.enum(['name', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type PartnerFilter = z.infer<typeof partnerFilterSchema>
