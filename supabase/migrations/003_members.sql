-- Migration 003: Members table

CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role_title TEXT,
  company TEXT,
  bio TEXT,
  avatar_url TEXT,
  twitter_url TEXT,
  skill_tags TEXT[] DEFAULT '{}',
  achievements JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read members"
  ON public.members FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Super admin and admin can create members"
  ON public.members FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
  );

CREATE POLICY "Super admin and admin can update all members, editor can update only"
  ON public.members FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true))
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
    OR (
      auth.uid() IN (SELECT id FROM public.admin_users WHERE role = 'editor' AND is_active = true)
      AND auth.uid() = created_by
    )
  );

CREATE POLICY "Only super admin and admin can delete members"
  ON public.members FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true));

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX members_name_search ON public.members USING gin(to_tsvector('english', full_name));
CREATE INDEX members_skill_tags_idx ON public.members USING gin(skill_tags);

-- Public read policy for active members
CREATE POLICY "Public can read active members"
  ON public.members FOR SELECT
  USING (is_active = true);
