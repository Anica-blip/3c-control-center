-- Clear demo character profiles with invalid local asset paths
DELETE FROM character_profiles WHERE avatar_url LIKE '%/src/assets/%';

-- Ensure media bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for character profile avatars
CREATE POLICY "Anyone can view character avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'character-avatars');

CREATE POLICY "Anyone can upload character avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'character-avatars');

CREATE POLICY "Anyone can update character avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'character-avatars');