-- Migration 017: Drop unused event columns
-- Remove slug, description, end_date, location_url, capacity columns

ALTER TABLE public.events
DROP COLUMN IF EXISTS slug,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS location_url,
DROP COLUMN IF EXISTS capacity;
