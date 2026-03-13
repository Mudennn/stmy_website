/**
 * Type definitions for homepage section metadata.
 * Used for type-safe prop extraction and validation.
 * Organized in order of homepage sections.
 */

// ============================================================================
// 1. HERO SECTION
// ============================================================================

/**
 * Hero section metadata - CMS editable: button title & link
 */
export interface HeroMetadata {
  ctaPrimary?: {
    label: string
    href: string
  }
  ctaSecondary?: {
    label: string
    href: string
  }
}

// ============================================================================
// 2. HIGHLIGHTS SECTION
// ============================================================================

export interface HighlightItem {
  id: string
  title: string
  description: string
  image: string
}

/**
 * Mission / Highlights metadata - CMS editable: item title, description, image
 */
export interface MissionMetadata {
  items?: HighlightItem[]
}

// ============================================================================
// 3. STATS SECTION
// ============================================================================

/**
 * Stats metadata - CMS editable: counter values only
 */
export interface StatsMetadata {
  counterValues?: number[]
}

// ============================================================================
// 4. EVENTS SECTION
// ============================================================================

/**
 * Events section - NO CMS metadata needed
 * Event data comes from dedicated events table (title, date, location, image)
 */
export interface EventsSectionMetadata {
  // Hardcoded in component, no CMS props needed
  [key: string]: never
}

// ============================================================================
// 5. MEMBERS SPOTLIGHT SECTION
// ============================================================================

/**
 * Members spotlight metadata - NO CMS metadata needed
 * Member data comes from dedicated members table
 */
export interface MembersSpotlightMetadata {
  // Hardcoded in component, no CMS props needed
  [key: string]: never
}

// ============================================================================
// 6. PARTNERS SECTION
// ============================================================================

/**
 * Partners ecosystem section metadata - NO CMS metadata needed
 * Partner data comes from dedicated partners table
 */
export interface PartnersMetadata {
  // Hardcoded in component, no CMS props needed
  [key: string]: never
}

// ============================================================================
// 7. COMMUNITY WALL SECTION
// ============================================================================

/**
 * Testimonial item
 */
export interface Testimonial {
  id?: number
  content: string
  author: string
  avatar: string
  tweetUrl?: string
}

/**
 * Community wall metadata - CMS editable: testimonials
 */
export interface CommunityWallMetadata {
  testimonials?: Testimonial[]
}

// ============================================================================
// 8. FAQ SECTION
// ============================================================================

/**
 * FAQ item
 */
export interface FaqItem {
  question: string
  answer: string
}

/**
 * FAQ metadata - CMS editable: questions & answers
 */
export interface FaqMetadata {
  items?: FaqItem[]
}

// ============================================================================
// 9. JOIN CTA SECTION
// ============================================================================

/**
 * Social link for join CTA and footer
 */
export interface SocialLink {
  platform?: string
  name?: string
  href: string
  icon?: string
}

/**
 * Join CTA section metadata - CMS editable: socials only
 * Hardcoded: heading, background image
 */
export interface JoinCtaMetadata {
  socials?: SocialLink[]
}

/**
 * Union type for all section metadata
 */
export type HomepageSectionMetadata =
  | HeroMetadata
  | MissionMetadata
  | StatsMetadata
  | EventsSectionMetadata
  | MembersSpotlightMetadata
  | PartnersMetadata
  | CommunityWallMetadata
  | FaqMetadata
  | JoinCtaMetadata
