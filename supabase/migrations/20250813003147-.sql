-- Create post_telegram_configs table for proper tracking
CREATE TABLE public.post_telegram_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_post_id UUID NOT NULL,
  telegram_config_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_telegram_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on post_telegram_configs" 
ON public.post_telegram_configs 
FOR ALL 
USING (true);

-- Associate all failed posts with the Forum platform (first we need to find it)
-- Reset failed posts back to pending status for retry
UPDATE scheduled_posts 
SET 
  status = 'pending',
  posting_status = 'pending',
  error_message = NULL,
  updated_at = NOW()
WHERE status = 'failed' 
  AND character_profile_id IS NOT NULL 
  AND scheduled_time IS NOT NULL;

-- Associate failed posts that had no platform selections with the Forum platform
-- First, find the Forum platform ID
INSERT INTO post_platforms (scheduled_post_id, platform_id)
SELECT sp.id, spf.id
FROM scheduled_posts sp
CROSS JOIN social_platforms spf
WHERE sp.status = 'pending' 
  AND spf.name = 'Forum'
  AND NOT EXISTS (
    SELECT 1 
    FROM post_platforms pp 
    WHERE pp.scheduled_post_id = sp.id
  );

-- Add indexes for performance
CREATE INDEX idx_post_platforms_scheduled_post_id ON post_platforms(scheduled_post_id);
CREATE INDEX idx_post_telegram_configs_scheduled_post_id ON post_telegram_configs(scheduled_post_id);
CREATE INDEX idx_scheduled_posts_status_time ON scheduled_posts(status, scheduled_time);