-- Update character profiles with new usernames and avatar URLs
UPDATE character_profiles 
SET 
  username = '@anica12',
  avatar_url = '/src/assets/anica-avatar.jpg'
WHERE name = 'Anica';

UPDATE character_profiles 
SET 
  username = '@caelum_3C',
  avatar_url = '/src/assets/caelum-avatar.jpg'
WHERE name = 'Caelum';

UPDATE character_profiles 
SET 
  username = '@aurion_3cmascot',
  avatar_url = '/src/assets/aurion-avatar.jpg'
WHERE name = 'Aurion';