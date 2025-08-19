-- EMERGENCY SECURITY FIX: Replace overly permissive RLS policies with authenticated-only access

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can manage character profiles" ON character_profiles;
DROP POLICY IF EXISTS "Anyone can view character profiles" ON character_profiles;
DROP POLICY IF EXISTS "Allow all operations on media_content" ON media_content;
DROP POLICY IF EXISTS "Allow all operations on scheduled_posts" ON scheduled_posts;
DROP POLICY IF EXISTS "Allow all operations on social_platforms" ON social_platforms;
DROP POLICY IF EXISTS "Allow all operations on post_platforms" ON post_platforms;
DROP POLICY IF EXISTS "Allow all operations on daily_schedule_prompts" ON daily_schedule_prompts;

-- Create secure RLS policies for character_profiles
CREATE POLICY "Authenticated users can view character profiles" 
ON character_profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage character profiles" 
ON character_profiles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create secure RLS policies for media_content  
CREATE POLICY "Authenticated users can view media content" 
ON media_content 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage media content" 
ON media_content 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create secure RLS policies for scheduled_posts
CREATE POLICY "Authenticated users can view scheduled posts" 
ON scheduled_posts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage scheduled posts" 
ON scheduled_posts 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create secure RLS policies for social_platforms
CREATE POLICY "Authenticated users can view social platforms" 
ON social_platforms 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage social platforms" 
ON social_platforms 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create secure RLS policies for post_platforms
CREATE POLICY "Authenticated users can view post platforms" 
ON post_platforms 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage post platforms" 
ON post_platforms 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create secure RLS policies for daily_schedule_prompts
CREATE POLICY "Authenticated users can view daily schedule prompts" 
ON daily_schedule_prompts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage daily schedule prompts" 
ON daily_schedule_prompts 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Add missing telegram_config table and secure it
CREATE TABLE IF NOT EXISTS telegram_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    label text NOT NULL,
    config_type text NOT NULL CHECK (config_type IN ('channel', 'group')),
    channel_id text NOT NULL,
    thread_id text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on telegram_config
ALTER TABLE telegram_config ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for telegram_config
CREATE POLICY "Authenticated users can view telegram config" 
ON telegram_config 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage telegram config" 
ON telegram_config 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create post_telegram_configs table for many-to-many relationship
CREATE TABLE IF NOT EXISTS post_telegram_configs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    scheduled_post_id uuid REFERENCES scheduled_posts(id) ON DELETE CASCADE,
    telegram_config_id uuid REFERENCES telegram_config(id) ON DELETE CASCADE,
    topic_link text,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(scheduled_post_id, telegram_config_id)
);

-- Enable RLS on post_telegram_configs
ALTER TABLE post_telegram_configs ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for post_telegram_configs
CREATE POLICY "Authenticated users can view post telegram configs" 
ON post_telegram_configs 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage post telegram configs" 
ON post_telegram_configs 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix the failed post by linking it to a character profile and adding platform associations
-- First, let's update any posts that have null character_profile_id to use the first available active profile
UPDATE scheduled_posts 
SET character_profile_id = (
    SELECT id FROM character_profiles 
    WHERE is_active = true 
    ORDER BY created_at 
    LIMIT 1
)
WHERE character_profile_id IS NULL;

-- Ensure all scheduled posts have at least one platform association
INSERT INTO post_platforms (scheduled_post_id, platform_id)
SELECT DISTINCT sp.id, plat.id
FROM scheduled_posts sp
CROSS JOIN (
    SELECT id FROM social_platforms 
    WHERE is_active = true 
    ORDER BY created_at 
    LIMIT 1
) plat
WHERE NOT EXISTS (
    SELECT 1 FROM post_platforms pp 
    WHERE pp.scheduled_post_id = sp.id
);