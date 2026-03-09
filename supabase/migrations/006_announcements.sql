-- Migration 006: Announcements table (top banner bar on landing page)

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  bg_color TEXT DEFAULT '#000000',
  text_color TEXT DEFAULT '#FFFFFF',
  is_active BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read announcements"
  ON public.announcements FOR SELECT
  USING (public.is_active_admin());

CREATE POLICY "Super admin and admin can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());

CREATE POLICY "Super admin and admin can update all announcements, editor can update only"
  ON public.announcements FOR UPDATE
  USING (public.is_active_admin())
  WITH CHECK (
    public.is_admin_or_super_admin()
    OR (public.is_editor() AND auth.uid() = created_by)
  );

CREATE POLICY "Only super admin and admin can delete announcements"
  ON public.announcements FOR DELETE
  USING (public.is_admin_or_super_admin());

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Public read policy for active announcements within date range
CREATE POLICY "Public can read active announcements"
  ON public.announcements FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );
