-- Migration 008: Column-level security via views
-- Separates public and admin data access to prevent leaking admin UUIDs
--
-- ISSUE: Public SELECT policies exposed created_by UUID field on all public tables.
-- PostgreSQL OR-combines permissive policies, so public users could read all columns
-- of published/active records, including admin references.
--
-- SOLUTION: Create views that exclude sensitive columns (created_by, updated_by, etc.)
-- and move public policies from tables to views. Admin access remains on tables.
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

CREATE VIEW public.events_public AS
SELECT
  id,
  title,
  description,
  event_date,
  location,
  status,
  created_at,
  updated_at
FROM public.events;

ALTER TABLE public.events_public ENABLE ROW LEVEL SECURITY;

-- Move public policy from table to view
DROP POLICY "Public can read published events" ON public.events;

CREATE POLICY "Public can read published events"
  ON public.events_public FOR SELECT
  USING (status = 'published');

-- ============================================================================
-- MEMBERS VIEW
-- ============================================================================

CREATE VIEW public.members_public AS
SELECT
  id,
  full_name,
  email,
  role_title,
  is_active,
  created_at,
  updated_at
FROM public.members;

ALTER TABLE public.members_public ENABLE ROW LEVEL SECURITY;

-- Move public policy from table to view
DROP POLICY "Public can read active members" ON public.members;

CREATE POLICY "Public can read active members"
  ON public.members_public FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- PARTNERS VIEW
-- ============================================================================

CREATE VIEW public.partners_public AS
SELECT
  id,
  name,
  logo_url,
  website_url,
  is_active,
  created_at,
  updated_at
FROM public.partners;

ALTER TABLE public.partners_public ENABLE ROW LEVEL SECURITY;

-- Move public policy from table to view
DROP POLICY "Public can read active partners" ON public.partners;

CREATE POLICY "Public can read active partners"
  ON public.partners_public FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- CMS_CONTENT VIEW
-- ============================================================================

CREATE VIEW public.cms_content_public AS
SELECT
  id,
  section,
  title,
  subtitle,
  body,
  is_published,
  created_at,
  updated_at
FROM public.cms_content;

ALTER TABLE public.cms_content_public ENABLE ROW LEVEL SECURITY;

-- Move public policy from table to view
DROP POLICY "Public can read published cms_content" ON public.cms_content;

CREATE POLICY "Public can read published cms_content"
  ON public.cms_content_public FOR SELECT
  USING (is_published = true);

-- ============================================================================
-- ANNOUNCEMENTS VIEW
-- ============================================================================

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
FROM public.announcements;

ALTER TABLE public.announcements_public ENABLE ROW LEVEL SECURITY;

-- Move public policy from table to view
DROP POLICY "Public can read active announcements" ON public.announcements;

CREATE POLICY "Public can read active announcements"
  ON public.announcements_public FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- SECURITY: Add deny-all policies to prevent accidental direct access
-- ============================================================================
-- Public users cannot directly query tables; they must use views

CREATE POLICY "Deny public access to events table"
  ON public.events FOR SELECT
  USING (false);

CREATE POLICY "Deny public access to members table"
  ON public.members FOR SELECT
  USING (false);

CREATE POLICY "Deny public access to partners table"
  ON public.partners FOR SELECT
  USING (false);

CREATE POLICY "Deny public access to cms_content table"
  ON public.cms_content FOR SELECT
  USING (false);

CREATE POLICY "Deny public access to announcements table"
  ON public.announcements FOR SELECT
  USING (false);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
--
-- How to use:
-- -----------
-- Admin/Editor API queries: SELECT FROM public.events (full access via is_active_admin())
-- Public API queries:       SELECT FROM public.events_public (limited columns)
--
-- Public views are read-only and automatically updated when base tables change.
-- If you add new sensitive columns to a table, add them to the deny list in the view.
--
-- Example update - if you add password_hash to users:
--   ALTER VIEW public.users_public AS SELECT id, name, email, ... (exclude password_hash)
--
