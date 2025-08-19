-- Create character profiles table
CREATE TABLE public.character_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  description TEXT,
  role TEXT NOT NULL, -- 'owner', 'ai', 'bot'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Character profiles are viewable by everyone" 
ON public.character_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Character profiles can be managed by everyone" 
ON public.character_profiles 
FOR ALL 
USING (true);

-- Add character profile reference to media_content table
ALTER TABLE public.media_content 
ADD COLUMN character_profile_id UUID REFERENCES public.character_profiles(id);

-- Add character profile reference to scheduled_posts table
ALTER TABLE public.scheduled_posts 
ADD COLUMN character_profile_id UUID REFERENCES public.character_profiles(id);

-- Insert default character profiles
INSERT INTO public.character_profiles (name, username, description, role) VALUES
('Anica', '@anica', 'The owner and main voice behind the content', 'owner'),
('Caelum', '@caelum_ai', 'AI assistant providing insights and automation', 'ai'),
('Aurion', '@aurion_bot', 'Telegram bot for automated messaging and interactions', 'bot');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_character_profiles_updated_at
BEFORE UPDATE ON public.character_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();