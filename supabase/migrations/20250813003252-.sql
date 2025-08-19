-- Reset failed posts back to pending status for retry
UPDATE scheduled_posts 
SET 
  status = 'pending',
  posting_status = 'pending',
  error_message = NULL,
  updated_at = NOW()
WHERE status = 'failed' 
  AND character_profile_id IS NOT NULL 
  AND scheduled_time IS NOT NULL;