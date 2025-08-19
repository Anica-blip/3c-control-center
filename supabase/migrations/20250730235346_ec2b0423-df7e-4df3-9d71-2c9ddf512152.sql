-- Create public chat sessions table for tracking webchat interactions
CREATE TABLE public.public_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  character_profile_id UUID REFERENCES public.character_profiles(id),
  user_identifier TEXT, -- IP or session identifier
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create public chat messages table
CREATE TABLE public.public_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.public_chat_sessions(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  bot_response TEXT,
  response_time_ms INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'completed' -- pending, completed, failed
);

-- Enable RLS
ALTER TABLE public.public_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for webchat, but secured for dashboard viewing)
CREATE POLICY "Public chat sessions can be created by anyone" 
ON public.public_chat_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public chat sessions can be viewed by anyone" 
ON public.public_chat_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Public chat messages can be created by anyone" 
ON public.public_chat_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public chat messages can be viewed by anyone" 
ON public.public_chat_messages 
FOR SELECT 
USING (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_public_chat_sessions_updated_at
BEFORE UPDATE ON public.public_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_public_chat_sessions_session_id ON public.public_chat_sessions(session_id);
CREATE INDEX idx_public_chat_messages_session_id ON public.public_chat_messages(session_id);
CREATE INDEX idx_public_chat_messages_timestamp ON public.public_chat_messages(timestamp DESC);