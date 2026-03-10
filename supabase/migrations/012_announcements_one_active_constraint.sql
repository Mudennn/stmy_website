-- Enforce at most one active announcement using a unique partial index
-- This prevents race conditions from concurrent INSERT/UPDATE operations
-- and makes the database itself the source of truth for the invariant
CREATE UNIQUE INDEX announcements_one_active
ON announcements (is_active)
WHERE is_active = true;
