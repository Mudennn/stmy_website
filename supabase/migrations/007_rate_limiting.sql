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

-- Function to check rate limit (returns true if allowed, false if exceeded)
-- Usage: SELECT check_rate_limit('192.168.1.1', 'login', 5, 300)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND attempted_at > now() - (p_window_seconds || ' seconds')::INTERVAL;

  -- If at or over limit, return false
  IF attempt_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  -- Record this attempt
  INSERT INTO public.rate_limits (identifier, action) VALUES (p_identifier, p_action);
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old rate limit entries (can be called via pg_cron or manually)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE attempted_at < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
