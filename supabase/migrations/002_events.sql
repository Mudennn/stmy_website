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
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true));

-- RLS: super_admin and admin can create/update; editor can update only
CREATE POLICY "Super admin and admin can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
  );

CREATE POLICY "Super admin and admin can update all events, editor can update only"
  ON public.events FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true))
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
    OR (
      auth.uid() IN (SELECT id FROM public.admin_users WHERE role = 'editor' AND is_active = true)
      AND auth.uid() = created_by
    )
  );

-- RLS: Only super_admin and admin can delete
CREATE POLICY "Only super admin and admin can delete events"
  ON public.events FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true));

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
