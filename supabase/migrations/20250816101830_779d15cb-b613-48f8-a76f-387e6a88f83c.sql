-- Remove telegram-related tables and configurations
DROP TABLE IF EXISTS post_telegram_configs CASCADE;
DROP TABLE IF EXISTS telegram_config CASCADE;

-- Remove any cron jobs that might be running
SELECT cron.unschedule(jobname) 
FROM cron.job 
WHERE jobname LIKE 'post_%' OR jobname LIKE '%telegram%' OR jobname LIKE '%scheduled%';

-- Remove cron-related functions that are no longer needed
DROP FUNCTION IF EXISTS public.schedule_post(bigint, timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS public.cancel_scheduled_post(bigint) CASCADE;
DROP FUNCTION IF EXISTS public.process_missed_scheduled_posts() CASCADE;
DROP FUNCTION IF EXISTS public.get_missed_scheduled_posts() CASCADE;
DROP FUNCTION IF EXISTS public.check_and_process_missed_posts() CASCADE;
DROP FUNCTION IF EXISTS public.reschedule_failed_posts(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.process_scheduled_content() CASCADE;
DROP FUNCTION IF EXISTS public.log_scheduled_posts_check() CASCADE;

-- Keep only the essential tables that your Render setup will use:
-- - scheduled_posts (main table)
-- - character_profiles 
-- - media_content
-- - social_platforms
-- - post_platforms (linking posts to platforms)
-- - diagnostic_logs (for error tracking)

-- Clean up any telegram-related data from existing posts
-- Note: keeping post_platforms as that's still needed for social media platforms