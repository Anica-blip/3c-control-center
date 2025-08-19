
-- Create table for social media platforms
CREATE TABLE public.social_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for media content (images, videos, files)
CREATE TABLE public.media_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT, -- 'image', 'video', 'gif', 'pdf', 'other'
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scheduled posts
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_content_id UUID REFERENCES public.media_content(id) ON DELETE CASCADE,
  post_description TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for posts and platforms (many-to-many relationship)
CREATE TABLE public.post_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.social_platforms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scheduled_post_id, platform_id)
);

-- Insert default social media platforms
INSERT INTO public.social_platforms (name, url) VALUES 
('Telegram', 'https://t.me/Aurion3cMascot_Bot'),
('Forum', 'https://club3c.forumeiros.com/');

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_platforms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on social_platforms" ON public.social_platforms FOR ALL USING (true);
CREATE POLICY "Allow all operations on media_content" ON public.media_content FOR ALL USING (true);
CREATE POLICY "Allow all operations on scheduled_posts" ON public.scheduled_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on post_platforms" ON public.post_platforms FOR ALL USING (true);
