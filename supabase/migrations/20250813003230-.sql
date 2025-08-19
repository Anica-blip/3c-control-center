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

-- Add indexes for performance
CREATE INDEX idx_post_platforms_scheduled_post_id ON post_platforms(scheduled_post_id);
CREATE INDEX idx_post_telegram_configs_scheduled_post_id ON post_telegram_configs(scheduled_post_id);
CREATE INDEX idx_scheduled_posts_status_time ON scheduled_posts(status, scheduled_time);