-- Migration 016: Add public read policy for partners table
-- Migration 008 dropped the public read policy and moved to a view
-- Since TypeScript types don't include views, we need the policy back on the base table

DO $$
BEGIN
  -- Drop if exists (for idempotency)
  DROP POLICY IF EXISTS "Public can read active partners" ON public.partners;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "Public can read active partners"
  ON public.partners FOR SELECT
  USING (is_active = true);
