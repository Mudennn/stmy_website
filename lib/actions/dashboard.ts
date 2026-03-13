/**
 * Server actions for dashboard statistics.
 * Fetches counts and recent activity for the dashboard overview.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

export interface DashboardStats {
  totalEvents: number
  totalMembers: number
  totalPartners: number
  activeUsers: number
}

export interface RecentEvent {
  id: string
  title: string
  event_date: string
  status: string
}

/**
 * Gets dashboard statistics (counts of key resources).
 * Only authenticated admins can access this.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  await getSession()

  const supabase = await createClient()

  // Fetch counts in parallel
  const [
    { count: eventCount, error: eventsError },
    { count: memberCount, error: membersError },
    { count: partnerCount, error: partnersError },
    { count: userCount, error: usersError },
  ] = await Promise.all([
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('members')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('partners')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  // Log any errors for debugging
  if (eventsError) console.error('Failed to fetch event count:', eventsError)
  if (membersError) console.error('Failed to fetch member count:', membersError)
  if (partnersError) console.error('Failed to fetch partner count:', partnersError)
  if (usersError) console.error('Failed to fetch active user count:', usersError)

  return {
    totalEvents: eventCount || 0,
    totalMembers: memberCount || 0,
    totalPartners: partnerCount || 0,
    activeUsers: userCount || 0,
  }
}

/**
 * Gets recent events for the dashboard.
 * Shows up to 5 most recent events.
 * Only authenticated admins can access this.
 */
export async function getRecentEvents(limit = 5): Promise<RecentEvent[]> {
  await getSession()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_date, status')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch recent events:', error)
    return []
  }

  return data || []
}
