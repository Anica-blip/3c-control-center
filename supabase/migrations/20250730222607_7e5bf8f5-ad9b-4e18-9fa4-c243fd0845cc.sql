-- Create character_profiles table for bot
CREATE TABLE public.character_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  description TEXT,
  role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_content table for bot
CREATE TABLE public.media_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  character_profile_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_posts table for bot
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_description TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  media_content_id UUID,
  character_profile_id UUID,
  telegram_group_id TEXT,
  telegram_thread_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (since this is for bot operations)
CREATE POLICY "Allow all operations on character_profiles" ON public.character_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on media_content" ON public.media_content FOR ALL USING (true);
CREATE POLICY "Allow all operations on scheduled_posts" ON public.scheduled_posts FOR ALL USING (true);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_character_profiles_updated_at
  BEFORE UPDATE ON public.character_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_content_updated_at
  BEFORE UPDATE ON public.media_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();