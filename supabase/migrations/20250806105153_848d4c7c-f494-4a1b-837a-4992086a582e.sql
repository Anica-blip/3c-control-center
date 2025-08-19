-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs every minute to process scheduled posts and messages
-- This will call our enhanced scheduled-posts-cron edge function
SELECT cron.schedule(
  'process-scheduled-content',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
      url := 'https://cgxjqsbrditbteqhdyus.supabase.co/functions/v1/scheduled-posts-cron',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneGpxc2JyZGl0YnRlcWhkeXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTY1ODEsImV4cCI6MjA2NjY5MjU4MX0.xUDy5ic-r52kmRtocdcW8Np9-lczjMZ6YKPXc03rIG4"}'::jsonb,
      body := '{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);