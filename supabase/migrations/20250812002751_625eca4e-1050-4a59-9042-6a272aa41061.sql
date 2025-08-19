-- Reset failed posts to pending status and add platform associations
UPDATE scheduled_posts 
SET status = 'pending', posting_status = 'pending' 
WHERE status = 'failed' 
  AND character_profile_id IS NOT NULL 
  AND media_content_id IS NOT NULL;

-- Add platform associations for posts that don't have any
-- We'll associate them with the Forum platform (first available platform)
INSERT INTO post_platforms (scheduled_post_id, platform_id)
SELECT sp.id, 'aba2a808-5237-40f6-b3b8-2d06e7b365bf'
FROM scheduled_posts sp
LEFT JOIN post_platforms pp ON sp.id = pp.scheduled_post_id
WHERE pp.scheduled_post_id IS NULL 
  AND sp.character_profile_id IS NOT NULL 
  AND sp.media_content_id IS NOT NULL
  AND sp.status = 'pending';

-- Clean up the completely broken post with no content or character
DELETE FROM scheduled_posts 
WHERE character_profile_id IS NULL 
  AND media_content_id IS NULL 
  AND post_description IS NULL;