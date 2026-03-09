-- Migration 001: Admin users and roles with 3-tier system (super_admin, admin, editor)

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'editor');

-- Admin users profile table, linked to Supabase auth.users
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'editor',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper functions to check authorization (bypass RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin') AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'editor' AND is_active = true
  );
$$;

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All active admin_users can read admin_users table
CREATE POLICY "Admin users can read admin_users"
  ON public.admin_users FOR SELECT
  USING (public.is_active_admin());

-- RLS Policy: Super admins can manage all admin_users (insert/update/delete)
CREATE POLICY "Super admins can manage all admin_users"
  ON public.admin_users FOR ALL
  USING (public.is_super_admin());

-- RLS Policy: Admins can create/update editors only (not admins)
CREATE POLICY "Admins can manage editors"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    public.is_admin_or_super_admin()
    AND role = 'editor'
  );

CREATE POLICY "Admins can update editors"
  ON public.admin_users FOR UPDATE
  USING (
    public.is_super_admin()
    OR (public.is_admin_or_super_admin() AND role = 'editor')
  )
  WITH CHECK (
    role = 'editor' OR public.is_super_admin()
  );

-- SECURITY NOTE: The above policy restricts WHICH ROWS admins can update (only editors),
-- but does not restrict WHICH COLUMNS they can modify. If new columns are added to
-- admin_users, this policy should be re-evaluated. Currently safe because:
-- - email: unique, shouldn't change after creation
-- - role: restricted by WITH CHECK (role = 'editor' for non-super-admins)
-- - id, created_at: immutable primary/timestamp keys
-- - updated_at: auto-managed by trigger
-- - is_active: intentional — admins should be able to activate/deactivate editors
-- - full_name: intentional — admins should be able to update display names
--
-- If sensitive columns (e.g., permissions JSONB) are added, move these checks to the
-- application layer or use Supabase custom claims / custom authorization functions.

-- Trigger function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on admin_users
CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
