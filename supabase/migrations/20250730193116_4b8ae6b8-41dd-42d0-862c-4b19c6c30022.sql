-- Update telegram_config table to have channel_id and thread_id columns
ALTER TABLE public.telegram_config 
DROP COLUMN IF EXISTS value,
ADD COLUMN channel_id TEXT,
ADD COLUMN thread_id TEXT;

-- Update existing records to use new structure
UPDATE public.telegram_config 
SET channel_id = CASE 
  WHEN label = 'group 1' THEN '-1002431571054'
  WHEN label = 'group 2' THEN '-1002377255109'
  ELSE NULL
END,
thread_id = CASE
  WHEN label = 'group 2' THEN '10'
  ELSE NULL
END;