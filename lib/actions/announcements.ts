'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession, requireAdmin } from '@/lib/auth/session'
import { announcementSchema, announcementFilterSchema } from '@/lib/schemas/announcement'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Announcement = Database['public']['Tables']['announcements']['Row']

/**
 * Fetch all announcements with filtering and pagination.
 * Authenticated users can see all announcements.
 * Unauthenticated users can only see currently active announcements within date range.
 */
export async function getAnnouncements(
  filters: Partial<z.infer<typeof announcementFilterSchema>> = {}
) {
  const supabase = await createClient()

  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  const validFilters = announcementFilterSchema.parse(filters)
  const { isActive, page, pageSize, sortBy, sortOrder } = validFilters

  let query = supabase.from('announcements').select('*', { count: 'exact' })

  if (!session) {
    const now = new Date().toISOString()
    query = query
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
  } else if (isActive !== undefined) {
    query = query.eq('is_active', isActive === 'true')
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch announcements: ${error.message}`)
  }

  return {
    announcements: data || [],
    totalCount: count || 0,
  }
}

/**
 * Fetch a single announcement by ID.
 */
export async function getAnnouncement(id: string): Promise<Announcement> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch announcement: ${error.message}`)
  }

  if (!data) {
    throw new Error('Announcement not found')
  }

  return data
}

/**
 * Create a new announcement.
 * Requires admin or super_admin role.
 * If is_active is true, deactivates all other announcements first.
 */
export async function createAnnouncement(input: unknown): Promise<Announcement> {
  const session = await requireAdmin()

  const data = announcementSchema.parse(input)

  // Validate date constraint
  if (data.startsAt && data.endsAt && data.endsAt < data.startsAt) {
    throw new Error('End time must be after start time')
  }

  const supabase = await createClient()

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      message: data.message,
      is_active: data.isActive,
      starts_at: data.startsAt || null,
      ends_at: data.endsAt || null,
      created_by: session.user.id,
    })
    .select('*')
    .single()

  if (error) {
    // Handle unique constraint violation on is_active
    if (error.code === '23505' && error.message.includes('announcements_one_active')) {
      throw new Error('An announcement is already active. Deactivate it first or set is_active to false.')
    }
    throw new Error(`Failed to create announcement: ${error.message}`)
  }

  if (!announcement) {
    throw new Error('Failed to create announcement')
  }

  return announcement
}

/**
 * Update an existing announcement.
 * Editors can only update; admins can update and delete.
 * If is_active is toggled on and another is already active, the database constraint will reject it.
 */
export async function updateAnnouncement(id: string, input: unknown): Promise<Announcement> {
  const session = await getSession()
  if (!['editor', 'admin', 'super_admin'].includes(session.adminUser.role)) {
    throw new Error('Unauthorized')
  }

  const data = announcementSchema.partial().parse(input)

  // Validate cross-field date constraint when both dates are provided
  if (data.startsAt && data.endsAt && data.endsAt < data.startsAt) {
    throw new Error('End time must be after start time')
  }

  // Validate cross-field date constraint for partial updates
  if (data.endsAt && !data.startsAt) {
    const supabase = await createClient()
    const { data: current } = await supabase
      .from('announcements')
      .select('starts_at')
      .eq('id', id)
      .single()
    if (current?.starts_at && data.endsAt < current.starts_at) {
      throw new Error('End time must be after start time')
    }
  }

  // Validate cross-field date constraint when only startsAt is provided
  if (data.startsAt && !data.endsAt) {
    const supabase = await createClient()
    const { data: current } = await supabase
      .from('announcements')
      .select('ends_at')
      .eq('id', id)
      .single()
    if (current?.ends_at && current.ends_at < data.startsAt) {
      throw new Error('End time must be after start time')
    }
  }

  const supabase = await createClient()

  const updateData: Partial<Database['public']['Tables']['announcements']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  if (data.message) updateData.message = data.message
  if (data.isActive !== undefined) updateData.is_active = data.isActive
  if (data.startsAt !== undefined) updateData.starts_at = data.startsAt || null
  if (data.endsAt !== undefined) updateData.ends_at = data.endsAt || null

  const { data: announcement, error } = await supabase
    .from('announcements')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    // Handle unique constraint violation on is_active
    if (error.code === '23505' && error.message.includes('announcements_one_active')) {
      throw new Error('An announcement is already active. Deactivate it first or set is_active to false.')
    }
    throw new Error(`Failed to update announcement: ${error.message}`)
  }

  if (!announcement) {
    throw new Error('Announcement not found')
  }

  return announcement
}

/**
 * Delete an announcement.
 * Requires admin or super_admin role.
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.from('announcements').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete announcement: ${error.message}`)
  }
}
