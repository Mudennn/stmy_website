'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { contentSchema, contentFilterSchema } from '@/lib/schemas/content'
import type { Database } from '@/types/database'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

type CmsContent = Database['public']['Tables']['cms_content']['Row']

/**
 * Fetch all CMS content sections with filtering and pagination.
 * Authenticated users can see all sections.
 * Unauthenticated users can only see published sections.
 */
export async function getContents(
  filters: Partial<z.infer<typeof contentFilterSchema>> = {}
) {
  const supabase = await createClient()

  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  const validFilters = contentFilterSchema.parse(filters)
  const { section, isPublished, page, pageSize, sortBy, sortOrder } = validFilters

  let query = supabase.from('cms_content').select('*', { count: 'exact' })

  if (!session) {
    query = query.eq('is_published', true)
  } else if (isPublished !== undefined) {
    query = query.eq('is_published', isPublished === 'true')
  }

  if (section) {
    query = query.eq('section', section)
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`)
  }

  return {
    contents: data || [],
    totalCount: count || 0,
  }
}

/**
 * Fetch a single content section by ID.
 * Unauthenticated users can only fetch published sections.
 */
export async function getContent(id: string): Promise<CmsContent> {
  const supabase = await createClient()

  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`)
  }

  if (!data) {
    throw new Error('Content not found')
  }

  if (!session && !data.is_published) {
    throw new Error('Content not found')
  }

  return data
}

/**
 * Update a CMS content section.
 * Editors can only update; admins can update.
 * No create or delete — sections are pre-seeded.
 */
export async function updateContent(id: string, input: unknown): Promise<CmsContent> {
  const session = await getSession()
  if (!['editor', 'admin', 'super_admin'].includes(session.adminUser.role)) {
    throw new Error('Unauthorized')
  }

  const data = contentSchema.partial().parse(input)

  // Parse metadata JSON string if provided
  let metadataParsed: Record<string, unknown> | null | undefined = undefined
  if (data.metadata !== undefined) {
    if (!data.metadata) {
      metadataParsed = null
    } else {
      try {
        metadataParsed = JSON.parse(data.metadata)
      } catch {
        throw new Error('Invalid metadata: must be valid JSON')
      }
    }
  }

  const supabase = await createClient()

  const updateData: Partial<Database['public']['Tables']['cms_content']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  if (data.title !== undefined) updateData.title = data.title || null
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle || null
  if (data.body !== undefined) updateData.body = data.body || null
  if (metadataParsed !== undefined) updateData.metadata = metadataParsed as Database['public']['Tables']['cms_content']['Update']['metadata']
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl || null
  if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder ?? null
  if (data.isPublished !== undefined) updateData.is_published = data.isPublished

  const { data: content, error } = await supabase
    .from('cms_content')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to update content: ${error.message}`)
  }

  if (!content) {
    throw new Error('Content not found')
  }

  // Revalidate homepage if any section was updated
  revalidatePath('/')

  return content
}
