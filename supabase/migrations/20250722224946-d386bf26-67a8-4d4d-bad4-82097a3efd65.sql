-- Create storage bucket for media content
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Create storage policies for media uploads
CREATE POLICY "Public media access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Anyone can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Anyone can update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Anyone can delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media');

-- Add telegram configuration table
CREATE TABLE public.telegram_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  config_type TEXT NOT NULL CHECK (config_type IN ('bot_id', 'channel_id', 'group_id')),
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on telegram_config
ALTER TABLE public.telegram_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on telegram_config" ON public.telegram_config FOR ALL USING (true);