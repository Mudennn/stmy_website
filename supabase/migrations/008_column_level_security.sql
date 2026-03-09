-- Migration 008: Column-level security via views
-- Separates public and admin data access to prevent leaking admin UUIDs
--
-- ISSUE: Public SELECT policies exposed created_by UUID field on all public tables.
-- PostgreSQL OR-combines permissive policies, so public users could read all columns
-- of published/active records, including admin references.
--
-- SOLUTION: Create SECURITY DEFINER-equivalent views (owned by postgres) that embed
-- row-filter logic directly in their WHERE clause. Because the view owner (postgres)
-- has BYPASSRLS, the base table is accessed without evaluating base table RLS. The
-- WHERE clause provides row filtering and the SELECT list provides column restriction.
--
-- Do NOT use view-level RLS policies — SECURITY INVOKER (the default) would cause
-- RLS to be re-evaluated as the anon caller, blocking all rows since no permissive
-- policy for anon exists on the base tables after the public policies are dropped.
--
-- Tables affected:
--   - events: Public can read published events
--   - members: Public can read active members
--   - partners: Public can read active partners
--   - cms_content: Public can read published content
--   - announcements: Public can read active announcements

-- ============================================================================
-- EVENTS VIEW
-- ============================================================================

-- Drop existing public policy from base table (anon must go through the view)
DROP POLICY "Public can read published events" ON public.events;

CREATE VIEW public.events_public AS
SELECT
  id,
  title,
  slug,
  description,
  image_url,
  event_date,
  end_date,
  location,
  luma_url,
  status,
  tags,
  created_at,
  updated_at
FROM public.events
WHERE status = 'published';

ALTER VIEW public.events_public OWNER TO postgres;

-- ============================================================================
-- MEMBERS VIEW
-- ============================================================================

-- Drop existing public policy from base table (anon must go through the view)
DROP POLICY "Public can read active members" ON public.members;

CREATE VIEW public.members_public AS
SELECT
  id,
  full_name,
  role_title,
  company,
  bio,
  avatar_url,
  twitter_url,
  skill_tags,
  achievements,
  is_featured,
  is_active,
  sort_order,
  created_at,
  updated_at
FROM public.members
WHERE is_active = true;

ALTER VIEW public.members_public OWNER TO postgres;

-- ============================================================================
-- PARTNERS VIEW
-- ============================================================================

-- Drop existing public policy from base table (anon must go through the view)
DROP POLICY "Public can read active partners" ON public.partners;

CREATE VIEW public.partners_public AS
SELECT
  id,
  name,
  logo_url,
  website_url,
  is_active,
  sort_order,
  created_at,
  updated_at
FROM public.partners
WHERE is_active = true;

ALTER VIEW public.partners_public OWNER TO postgres;

-- ============================================================================
-- CMS_CONTENT VIEW
-- ============================================================================

-- Drop existing public policy from base table (anon must go through the view)
DROP POLICY "Public can read published cms_content" ON public.cms_content;

CREATE VIEW public.cms_content_public AS
SELECT
  id,
  section,
  title,
  subtitle,
  body,
  image_url,
  metadata,
  sort_order,
  is_published,
  created_at,
  updated_at
FROM public.cms_content
WHERE is_published = true;

ALTER VIEW public.cms_content_public OWNER TO postgres;

-- ============================================================================
-- ANNOUNCEMENTS VIEW
-- ============================================================================

-- Drop existing public policy from base table (anon must go through the view)
DROP POLICY "Public can read active announcements" ON public.announcements;

CREATE VIEW public.announcements_public AS
SELECT
  id,
  message,
  link_url,
  link_text,
  bg_color,
  text_color,
  is_active,
  created_at,
  updated_at
FROM public.announcements
WHERE is_active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now());

ALTER VIEW public.announcements_public OWNER TO postgres;

-- ============================================================================
-- GRANTS
-- ============================================================================
-- Explicitly grant SELECT on all public views to anon and authenticated roles.
-- Supabase's ALTER DEFAULT PRIVILEGES only covers objects created by the
-- configured role at bootstrap time. Without explicit grants, anon may receive
-- permission denied on these views even though the base table public policies
-- were intentionally removed in favour of view-based access.

GRANT SELECT ON public.events_public TO anon, authenticated;
GRANT SELECT ON public.members_public TO anon, authenticated;
GRANT SELECT ON public.partners_public TO anon, authenticated;
GRANT SELECT ON public.cms_content_public TO anon, authenticated;
GRANT SELECT ON public.announcements_public TO anon, authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
--
-- How it works:
-- -------------
-- Views are created by postgres (owner), which has BYPASSRLS. When anon queries
-- a view, PostgreSQL uses the view owner's privileges to access the base table,
-- bypassing base table RLS entirely. Row filtering is enforced by the WHERE clause
-- in the view definition; column restriction is enforced by the SELECT list.
--
-- anon cannot directly query the base tables because the only remaining policy is
-- the admin-only one (is_active_admin()), and RLS fails-closed when no permissive
-- policy matches the calling user.
--
-- How to use:
-- -----------
-- Admin/Editor API queries: SELECT FROM public.events (full access via is_active_admin())
-- Public API queries:       SELECT FROM public.events_public (limited columns, published only)
--
-- Public views are read-only and automatically updated when base tables change.
-- If you add new sensitive columns to a table, ensure they are NOT in the view SELECT list.
--
