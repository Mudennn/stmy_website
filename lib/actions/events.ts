'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession, requireAdmin } from '@/lib/auth/session'
import { eventSchema, eventFilterSchema } from '@/lib/schemas/event'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Event = Database['public']['Tables']['events']['Row']

/**
 * Fetch all events with filtering, searching, and pagination.
 * Public read access: only published events are visible to unauthenticated users.
 */
export async function getEvents(
  filters: Partial<z.infer<typeof eventFilterSchema>> = {}
) {
  const supabase = await createClient()

  // Validate filters
  const validFilters = eventFilterSchema.parse(filters)
  const { search, status, page, pageSize, sortBy, sortOrder } = validFilters

  // Build query
  let query = supabase.from('events').select('*', { count: 'exact' })

  // Search by title
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  // Filter by status
  if (status) {
    query = query.eq('status', status)
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
  await requireAdmin()

  // Validate input
  const data = eventSchema.parse(input)

  const session = await getSession()
  const supabase = await createClient()

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
      image_url: data.imageUrl || null,
      status: data.status,
      capacity: data.capacity || null,
      tags: data.tags || null,
      created_by: session.user.id,
    })
    .select('*')
    .single()

  if (error) {
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

  // Validate input
  const data = eventSchema.partial().parse(input)

  const supabase = await createClient()

  // Build update object
  const updateData: Partial<Database['public']['Tables']['events']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  if (data.title) updateData.title = data.title
  if (data.slug) updateData.slug = data.slug
  if (data.description !== undefined) updateData.description = data.description
  if (data.eventDate) updateData.event_date = data.eventDate
  if (data.endDate !== undefined) updateData.end_date = data.endDate
  if (data.location !== undefined) updateData.location = data.location
  if (data.locationUrl !== undefined) updateData.location_url = data.locationUrl
  if (data.lumaUrl !== undefined) updateData.luma_url = data.lumaUrl
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl
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
    throw new Error(`Failed to update event: ${error.message}`)
  }

  if (!event) {
    throw new Error('Event not found')
  }

  return event
}

/**
 * Delete an event.
 * Requires admin or super_admin role.
 */
export async function deleteEvent(id: string): Promise<void> {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`)
  }
}
