-- Repo path: supabase/migrations/20261122190106_storage_media_owner_only.sql
-- Storage bucket 'media': owner only (Standard B9). Project: 3C Control Center.
-- Files stay viewable by their address (the bucket stays public). No rule is left that lets
-- visitors list, upload, replace or delete. Rollback: rollback/20261122190106_storage_media_owner_only.sql

DROP POLICY IF EXISTS "Anyone can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update character avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload character avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view character avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Public media access" ON storage.objects;

CREATE POLICY "owner_select_media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media' AND (SELECT public.is_owner()));
CREATE POLICY "owner_insert_media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND (SELECT public.is_owner()));
CREATE POLICY "owner_update_media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND (SELECT public.is_owner())) WITH CHECK (bucket_id = 'media' AND (SELECT public.is_owner()));
CREATE POLICY "owner_delete_media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND (SELECT public.is_owner()));
