-- Migration 007: Rate limiting table and functions

CREATE TABLE public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny all direct access — only the check_rate_limit SECURITY DEFINER function should access this table
CREATE POLICY "Deny all access to rate_limits"
  ON public.rate_limits
  USING (false);

CREATE INDEX rate_limits_lookup ON public.rate_limits (identifier, action, attempted_at);
CREATE INDEX rate_limits_cleanup_idx ON public.rate_limits (attempted_at);

-- Function to check rate limit (read-only, no side effects)
-- Returns true if allowed (under limit), false if exceeded
-- Usage: SELECT check_rate_limit('192.168.1.1', 'login', 5, 300)
-- SECURITY: Set search_path to empty string to prevent schema shadowing attacks
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window (ONLY failed attempts recorded by record_failed_attempt)
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND attempted_at > now() - (p_window_seconds || ' seconds')::INTERVAL;

  -- If at or over limit, return false (blocked)
  IF attempt_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  -- Under limit, return true (allowed)
  RETURN true;
END;
$$;

-- Function to record a failed attempt (only called after auth failure)
-- Must be called separately from check_rate_limit to distinguish failed vs successful attempts
-- Usage: SELECT record_failed_attempt('192.168.1.1', 'login')
-- SECURITY: Set search_path to empty string to prevent schema shadowing attacks
CREATE OR REPLACE FUNCTION public.record_failed_attempt(
  p_identifier TEXT,
  p_action TEXT
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.rate_limits (identifier, action) VALUES (p_identifier, p_action);
END;
$$;

-- Function to cleanup old rate limit entries (can be called via pg_cron or manually)
-- SECURITY DEFINER required to bypass deny-all RLS policy on rate_limits table
-- SECURITY: Set search_path to empty string to prevent schema shadowing attacks
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits() RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE attempted_at < now() - INTERVAL '1 hour';
END;
$$;

-- ============================================================================
-- CRITICAL: Revoke direct execution from unprivileged roles
-- ============================================================================
-- By default, Supabase grants EXECUTE to anon and authenticated roles.
-- This would allow unauthenticated clients to:
--   1. Call record_failed_attempt() in a loop to lock out any IP (DoS on rate limiting)
--   2. Call cleanup_rate_limits() to erase their own rate limit records
--
-- All legitimate calls go through the server-side wrappers (checkRateLimit, recordFailedAttempt),
-- which use the service-role admin client, so client-side access is not needed.
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_failed_attempt(TEXT, TEXT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM anon, authenticated;
