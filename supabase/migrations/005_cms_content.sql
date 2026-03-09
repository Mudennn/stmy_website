-- Migration 005: CMS Content table (aligned with landing-page.md sections)

CREATE TYPE public.content_section AS ENUM (
  'hero',
  'mission',
  'stats',
  'events_section',
  'members_spotlight',
  'partners_ecosystem',
  'community_wall',
  'faq',
  'join_cta',
  'footer'
);

CREATE TABLE public.cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section public.content_section NOT NULL,
  title TEXT,
  subtitle TEXT,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read cms_content"
  ON public.cms_content FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Super admin and admin can create cms_content"
  ON public.cms_content FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
  );

CREATE POLICY "Super admin and admin can update all cms_content, editor can update only"
  ON public.cms_content FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true))
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
    OR (
      auth.uid() IN (SELECT id FROM public.admin_users WHERE role = 'editor' AND is_active = true)
      AND auth.uid() = created_by
    )
  );

CREATE POLICY "Only super admin and admin can delete cms_content"
  ON public.cms_content FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true));

CREATE TRIGGER cms_content_updated_at
  BEFORE UPDATE ON public.cms_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX cms_content_section_idx ON public.cms_content (section);

-- Public read policy for published cms_content
CREATE POLICY "Public can read published cms_content"
  ON public.cms_content FOR SELECT
  USING (is_published = true);
