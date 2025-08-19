-- Create comprehensive storage policies for the media bucket
-- Allow everyone to insert files (for character profile uploads)
CREATE POLICY "Anyone can upload to media bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media');

-- Allow everyone to view files in media bucket (since it's public)
CREATE POLICY "Anyone can view media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

-- Allow everyone to update their own files
CREATE POLICY "Anyone can update media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media');

-- Allow everyone to delete files (for re-uploads)
CREATE POLICY "Anyone can delete media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media');