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
  USING (public.is_active_admin());

CREATE POLICY "Super admin and admin can create partners"
  ON public.partners FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());

CREATE POLICY "Super admin and admin can update all partners, editor can update only"
  ON public.partners FOR UPDATE
  USING (public.is_active_admin())
  WITH CHECK (
    public.is_admin_or_super_admin()
    OR (public.is_editor() AND auth.uid() = created_by)
  );

CREATE POLICY "Only super admin and admin can delete partners"
  ON public.partners FOR DELETE
  USING (public.is_admin_or_super_admin());

CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Public read policy for active partners
CREATE POLICY "Public can read active partners"
  ON public.partners FOR SELECT
  USING (is_active = true);
