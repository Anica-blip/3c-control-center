-- Add channel_group and thread_id columns to scheduled_posts table
ALTER TABLE public.scheduled_posts 
ADD COLUMN IF NOT EXISTS channel_group TEXT,
ADD COLUMN IF NOT EXISTS thread_id TEXT;

-- Insert or update the character profiles with correct roles
INSERT INTO public.character_profiles (id, name, username, role, description, is_active, user_id)
VALUES 
  (gen_random_uuid(), 'Owner', '@owner', 'owner', 'Platform Owner', true, auth.uid()),
  (gen_random_uuid(), 'Caelum', '@caelum', '3C Manager', '3C Platform Manager', true, auth.uid()),
  (gen_random_uuid(), 'Aurion', '@aurion', '3C Mascot', '3C Platform Mascot', true, auth.uid())
ON CONFLICT (username) DO UPDATE SET
  role = EXCLUDED.role,
  description = EXCLUDED.description,
  is_active = true;