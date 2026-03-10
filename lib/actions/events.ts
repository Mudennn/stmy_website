'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, requireAdmin } from '@/lib/auth/session'
import { eventSchema, eventFilterSchema } from '@/lib/schemas/event'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Event = Database['public']['Tables']['events']['Row']

/**
 * Fetch all events with filtering, searching, and pagination.
 * Authenticated users can see all events and filter by any status.
 * Unauthenticated users can only see published events.
 */
export async function getEvents(
  filters: Partial<z.infer<typeof eventFilterSchema>> = {}
) {
  const supabase = await createClient()

  // Check authentication
  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  // Validate filters
  const validFilters = eventFilterSchema.parse(filters)
  const { search, status, page, pageSize, sortBy, sortOrder } = validFilters

  // Build query
  let query = supabase.from('events').select('*', { count: 'exact' })

  // Restrict unauthenticated callers to published events only
  if (!session) {
    query = query.eq('status', 'published')
  } else if (status) {
    query = query.eq('status', status)
  }

  // Search by title
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  // Sorting
  const sortColumn = sortBy === 'event_date' ? 'event_date' : sortBy
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

  // Pagination
  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`)
  }

  return {
    events: data || [],
    totalCount: count || 0,
  }
}

/**
 * Fetch a single event by ID.
 */
export async function getEvent(id: string): Promise<Event> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch event: ${error.message}`)
  }

  if (!data) {
    throw new Error('Event not found')
  }

  return data
}

/**
 * Create a new event.
 * Requires admin or super_admin role.
 */
export async function createEvent(input: unknown): Promise<Event> {
  const session = await requireAdmin()

  // Validate input
  const data = eventSchema.parse(input)

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Upload image if provided
  let imageUrl: string | null = null
  let filePath: string | null = null

  if (data.image) {
    const fileExt = data.image.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    filePath = `events/${fileName}`

    const buffer = await data.image.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('event-images')
      .upload(filePath, Buffer.from(buffer), {
        contentType: data.image.type,
      })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    const { data: publicUrlData } = adminClient.storage
      .from('event-images')
      .getPublicUrl(filePath)

    imageUrl = publicUrlData.publicUrl
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      event_date: data.eventDate,
      end_date: data.endDate || null,
      location: data.location || null,
      location_url: data.locationUrl || null,
      luma_url: data.lumaUrl || null,
      image_url: imageUrl,
      status: data.status,
      capacity: data.capacity || null,
      tags: data.tags || null,
      created_by: session.user.id,
    })
    .select('*')
    .single()

  if (error) {
    // Clean up the orphaned storage object if upload succeeded but DB insert failed
    if (filePath) {
      await adminClient.storage.from('event-images').remove([filePath])
    }
    throw new Error(`Failed to create event: ${error.message}`)
  }

  if (!event) {
    throw new Error('Failed to create event')
  }

  return event
}

/**
 * Update an existing event.
 * Editors can only update; admins can update and delete.
 */
export async function updateEvent(id: string, input: unknown): Promise<Event> {
  const session = await getSession()
  if (!['editor', 'admin', 'super_admin'].includes(session.adminUser.role)) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const data = eventSchema.partial().parse(input)

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Build update object
  const updateData: Partial<Database['public']['Tables']['events']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  // Handle image upload if a new file is provided
  let filePath: string | null = null
  let oldImageUrl: string | null = null

  if (data.image) {
    // Fetch existing image URL before upload so we can clean it up after a successful update
    const { data: existing } = await supabase.from('events').select('image_url').eq('id', id).single()
    oldImageUrl = existing?.image_url ?? null

    const fileExt = data.image.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    filePath = `events/${fileName}`

    const buffer = await data.image.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('event-images')
      .upload(filePath, Buffer.from(buffer), {
        contentType: data.image.type,
      })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    const { data: publicUrlData } = adminClient.storage
      .from('event-images')
      .getPublicUrl(filePath)

    updateData.image_url = publicUrlData.publicUrl
  }

  if (data.title) updateData.title = data.title
  if (data.slug) updateData.slug = data.slug
  if (data.description !== undefined) updateData.description = data.description
  if (data.eventDate) updateData.event_date = data.eventDate
  if (data.endDate !== undefined) updateData.end_date = data.endDate
  if (data.location !== undefined) updateData.location = data.location
  if (data.locationUrl !== undefined) updateData.location_url = data.locationUrl
  if (data.lumaUrl !== undefined) updateData.luma_url = data.lumaUrl
  if (data.status) updateData.status = data.status
  if (data.capacity !== undefined) updateData.capacity = data.capacity
  if (data.tags !== undefined) updateData.tags = data.tags

  const { data: event, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    // Clean up the orphaned storage object if upload succeeded but DB update failed
    if (filePath) {
      await adminClient.storage.from('event-images').remove([filePath])
    }
    throw new Error(`Failed to update event: ${error.message}`)
  }

  if (!event) {
    throw new Error('Event not found')
  }

  // Clean up old image after successful DB update — non-fatal
  if (oldImageUrl) {
    try {
      const oldPath = new URL(oldImageUrl).pathname.split('/event-images/')[1]
      if (oldPath) {
        await adminClient.storage.from('event-images').remove([oldPath])
      }
    } catch {
      console.error('Failed to clean up old storage object for updated event', id)
    }
  }

  return event
}

/**
 * Delete an event.
 * Requires admin or super_admin role.
 * Cleans up associated storage objects.
 */
export async function deleteEvent(id: string): Promise<void> {
  await requireAdmin()

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Fetch image URL before deleting so we can clean up storage
  const { data: event } = await supabase
    .from('events')
    .select('image_url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`)
  }

  // Clean up orphaned storage object — non-fatal
  if (event?.image_url) {
    try {
      const filePath = new URL(event.image_url).pathname.split('/event-images/')[1]
      if (filePath) {
        await adminClient.storage.from('event-images').remove([filePath])
      }
    } catch {
      console.error('Failed to clean up storage object for deleted event', id)
    }
  }
}
