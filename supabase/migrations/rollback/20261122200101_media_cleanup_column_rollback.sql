-- Rollback for 20261122200101_media_cleanup_column.sql
-- Note: this also removes any housekeeping dates already stamped.
ALTER TABLE public.dashboard_posts DROP COLUMN IF EXISTS media_removed_at;
