-- Rollback for 20261122200102_media_cleanup_functions.sql
DROP FUNCTION IF EXISTS public.media_cleanup_report();
DROP FUNCTION IF EXISTS public.media_mark_removed(text[]);
