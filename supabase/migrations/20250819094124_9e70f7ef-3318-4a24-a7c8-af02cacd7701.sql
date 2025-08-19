-- Add channel_group and thread_id columns to scheduled_posts table
ALTER TABLE public.scheduled_posts 
ADD COLUMN IF NOT EXISTS channel_group TEXT,
ADD COLUMN IF NOT EXISTS thread_id TEXT;

-- Update existing character profiles with correct roles
UPDATE public.character_profiles 
SET role = '3C Manager', description = '3C Platform Manager'
WHERE name = 'Caelum';

UPDATE public.character_profiles 
SET role = '3C Mascot', description = '3C Platform Mascot'  
WHERE name = 'Aurion';