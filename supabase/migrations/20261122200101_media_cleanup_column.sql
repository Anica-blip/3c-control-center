-- 3C Control Center - media clean-up, step 1 of 2
-- Adds the housekeeping date on dashboard_posts: when a post's media files were cleared.
-- Rollback: rollback/20261122200101_media_cleanup_column.sql

ALTER TABLE public.dashboard_posts
  ADD COLUMN IF NOT EXISTS media_removed_at timestamptz;

COMMENT ON COLUMN public.dashboard_posts.media_removed_at IS
  'Housekeeping date: when this post''s media files were removed from the content-media bucket. NULL = not removed.';
