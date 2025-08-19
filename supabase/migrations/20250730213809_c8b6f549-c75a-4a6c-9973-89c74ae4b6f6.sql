-- Create table for scheduled posts that matches the user's existing bot structure
CREATE TABLE public.daily_schedule_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  frequency TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  "group" TEXT,
  thread_id TEXT,
  title TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.daily_schedule_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for full access (matching your existing setup)
CREATE POLICY "Allow all operations on daily_schedule_prompts" 
ON public.daily_schedule_prompts 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_schedule_prompts_updated_at
BEFORE UPDATE ON public.daily_schedule_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();