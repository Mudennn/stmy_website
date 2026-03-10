-- Migration 002: Events table

CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  location_url TEXT,
  luma_url TEXT,
  image_url TEXT,
  status public.event_status NOT NULL DEFAULT 'draft',
  capacity INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS: All admin_users can read
CREATE POLICY "Admin users can read events"
  ON public.events FOR SELECT
  USING (public.is_active_admin());

-- RLS: super_admin and admin can create/update; editor can update only
CREATE POLICY "Super admin and admin can create events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());

CREATE POLICY "Super admin and admin can update all events, editor can update only"
  ON public.events FOR UPDATE
  USING (public.is_active_admin())
  WITH CHECK (
    public.is_admin_or_super_admin()
    OR (public.is_editor() AND auth.uid() = created_by)
  );

-- RLS: Only super_admin and admin can delete
CREATE POLICY "Only super admin and admin can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin_or_super_admin());

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Indexes for performance
CREATE INDEX events_title_search ON public.events USING gin(to_tsvector('english', title));
CREATE INDEX events_status_idx ON public.events (status);
CREATE INDEX events_event_date_idx ON public.events (event_date);

-- Public read policy for published events
CREATE POLICY "Public can read published events"
  ON public.events FOR SELECT
  USING (status = 'published');
