
-- Add owner_id type to telegram_config table
ALTER TABLE public.telegram_config 
DROP CONSTRAINT IF EXISTS telegram_config_config_type_check;

ALTER TABLE public.telegram_config 
ADD CONSTRAINT telegram_config_config_type_check 
CHECK (config_type IN ('bot_id', 'channel_id', 'group_id', 'owner_id'));

-- Add metadata field for additional information like topics
ALTER TABLE public.telegram_config 
ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create social_accounts table for external integrations
CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- 'canva', 'notion', etc.
  account_name TEXT NOT NULL,
  account_username TEXT,
  connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  account_metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on social_accounts
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on social_accounts" ON public.social_accounts FOR ALL USING (true);

-- Insert the provided Telegram configurations
INSERT INTO public.telegram_config (label, config_type, value, metadata) VALUES
('Owner', 'owner_id', '1377419565', '{"description": "Main owner account"}'),
('Aurion Bot', 'bot_id', '7796375676', '{"bot_username": "@Aurion3cMascot_Bot"}'),
('Channel 1', 'channel_id', '-1002431571054', '{"description": "Main channel"}'),
('Group 1', 'group_id', '-1002431571054', '{"description": "Main group"}'),
('Group 2', 'group_id', '-1002377255109', '{"description": "Secondary group", "topics_link": "https://t.me/c/2377255109/10"});
