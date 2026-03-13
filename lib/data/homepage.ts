/**
 * Homepage data fetching layer — public async functions for Server Components.
 * NOT server actions. Uses the anon client; RLS policies handle public access.
 */

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type {
  HeroMetadata,
  MissionMetadata,
  StatsMetadata,
  CommunityWallMetadata,
  FaqMetadata,
  JoinCtaMetadata,
} from '@/types/homepage'

type CmsContent = Database['public']['Tables']['cms_content']['Row']
type Event = Database['public']['Tables']['events']['Row']
type Member = Database['public']['Tables']['members']['Row']
type Partner = Database['public']['Tables']['partners']['Row']
type Announcement = Database['public']['Tables']['announcements']['Row']

/**
 * Fetch all published cms_content sections as a Map for easy lookup.
 * Unauthenticated access only returns published sections (enforced by RLS).
 */
export async function getHomepageContent(): Promise<Map<string, CmsContent>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[Homepage Data] Failed to fetch cms_content:', error.message)
    return new Map()
  }

  const contentMap = new Map<string, CmsContent>()
  data?.forEach((row) => {
    contentMap.set(row.section, row)
  })

  return contentMap
}

/**
 * Fetch published events, split into upcoming and past.
 * Two separate queries guarantee up to `limit` events in each category.
 */
export async function getHomepageEvents(limit = 5): Promise<{
  upcoming: Event[]
  past: Event[]
}> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [upcomingResult, pastResult] = await Promise.all([
    // Upcoming: events >= now, ordered ascending (nearest first)
    supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('event_date', now)
      .order('event_date', { ascending: true })
      .limit(limit),
    // Past: events < now, ordered descending (most recent first)
    supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .lt('event_date', now)
      .order('event_date', { ascending: false })
      .limit(limit),
  ])

  if (upcomingResult.error) {
    console.error('[Homepage Data] Failed to fetch upcoming events:', upcomingResult.error.message)
  }
  if (pastResult.error) {
    console.error('[Homepage Data] Failed to fetch past events:', pastResult.error.message)
  }

  return {
    upcoming: upcomingResult.data || [],
    past: pastResult.data || [],
  }
}

/**
 * Fetch active featured members for spotlight (limit 9).
 */
export async function getHomepageMembers(limit = 9): Promise<Member[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit)

  if (error) {
    console.error('[Homepage Data] Failed to fetch members:', error.message)
    return []
  }

  return data || []
}

/**
 * Fetch all active partners for ecosystem section.
 * RLS policy ensures anon users only read is_active = true partners.
 */
export async function getHomepagePartners(): Promise<Partner[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('is_active', true)

  if (error) {
    return []
  }

  return data || []
}

/**
 * Fetch active announcement for banner display.
 * Returns the first active announcement within its date range, or null if none exist.
 */
export async function getHomepageAnnouncement(): Promise<Announcement | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[Homepage Data] Failed to fetch announcement:', error.message)
    return null
  }

  return data?.[0] || null
}

// ============================================================================
// 1. HERO SECTION
// ============================================================================

/**
 * Extract hero props
 * CMS editable: ctaPrimary (label, href), ctaSecondary (label, href)
 * Hardcoded: heading, description, backgroundImage
 */
export function extractHeroProps(row: CmsContent | undefined) {
  const meta = row?.metadata as HeroMetadata | null

  return {
    ctaPrimary: meta?.ctaPrimary,
    ctaSecondary: meta?.ctaSecondary,
  }
}

// ============================================================================
// 2. HIGHLIGHTS SECTION
// ============================================================================

/**
 * Extract highlights props
 * CMS editable: items array (title, description, image)
 * Hardcoded: section label, header text
 */
export function extractHighlightsProps(row: CmsContent | undefined) {
  const meta = row?.metadata as MissionMetadata | null

  return {
    items: meta?.items,
  }
}

// ============================================================================
// 3. STATS SECTION
// ============================================================================

/**
 * Extract stats props
 * CMS editable: counterValues (array of numbers)
 * Hardcoded: counter labels/descriptions, reach section text, section header
 */
export function extractStatsProps(row: CmsContent | undefined) {
  const meta = row?.metadata as StatsMetadata | null

  return {
    counterValues: meta?.counterValues,
  }
}

// ============================================================================
// 4. EVENTS SECTION
// ============================================================================

/**
 * Extract events section props
 * NO CMS props needed - section header is hardcoded
 * Event data comes from dedicated events table
 * CMS editable: title, event_date, location, image_url (via events table)
 */
export function extractEventsSectionProps() {
  // Events section header is hardcoded in component
  // Event data comes from dedicated events table
  return {}
}

// ============================================================================
// 5. MEMBERS SPOTLIGHT SECTION
// ============================================================================

/**
 * Extract members spotlight props
 */
export function extractMembersSpotlightProps() {
  return {}
}

// ============================================================================
// 6. PARTNERS SECTION
// ============================================================================

/**
 * Extract partners section props
 */
export function extractPartnersProps() {
  return {}
}

// ============================================================================
// 7. COMMUNITY WALL SECTION
// ============================================================================

/**
 * Extract community wall props
 * CMS editable: testimonials array (content, author, avatar)
 * Hardcoded: section label, title, description
 */
export function extractCommunityProps(row: CmsContent | undefined) {
  const meta = row?.metadata as CommunityWallMetadata | null

  return {
    testimonials: meta?.testimonials ?? [],
  }
}

// ============================================================================
// 8. FAQ SECTION
// ============================================================================

/**
 * Extract FAQ props
 * CMS editable: items array (question, answer)
 */
export function extractFaqProps(row: CmsContent | undefined) {
  const meta = row?.metadata as FaqMetadata | null

  return {
    items: meta?.items ?? [],
  }
}

// ============================================================================
// 9. JOIN CTA SECTION
// ============================================================================

/**
 * Extract join CTA props
 * CMS editable: social links only
 * Hardcoded: heading, background image
 */
export function extractJoinCtaProps(row: CmsContent | undefined) {
  const meta = row?.metadata as JoinCtaMetadata | null

  const defaultSocials = [
    { platform: 'twitter', href: '#', icon: 'Twitter' },
    { platform: 'telegram', href: '#', icon: 'Send' },
    { platform: 'discord', href: '#', icon: 'Disc' },
  ]

  return {
    socials: meta?.socials ?? defaultSocials,
  }
}
