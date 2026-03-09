-- Migration 004: Partners table (simplified - logo management only)

CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read partners"
  ON public.partners FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Super admin and admin can create partners"
  ON public.partners FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
  );

CREATE POLICY "Super admin and admin can update all partners, editor can update only"
  ON public.partners FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE is_active = true))
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true)
    OR (
      auth.uid() IN (SELECT id FROM public.admin_users WHERE role = 'editor' AND is_active = true)
      AND auth.uid() = created_by
    )
  );

CREATE POLICY "Only super admin and admin can delete partners"
  ON public.partners FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users WHERE role IN ('super_admin', 'admin') AND is_active = true));

CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Public read policy for active partners
CREATE POLICY "Public can read active partners"
  ON public.partners FOR SELECT
  USING (is_active = true);
