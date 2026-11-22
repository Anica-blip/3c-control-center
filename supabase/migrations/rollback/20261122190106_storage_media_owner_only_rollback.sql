-- Repo path: supabase/migrations/rollback/20261122190106_storage_media_owner_only_rollback.sql
-- Puts back the rules that bucket 'media' had on 22 Nov 2026 (they were open to visitors).
-- Only run this to undo 20261122190106_storage_media_owner_only.sql.

DROP POLICY IF EXISTS "owner_select_media" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_media" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_media" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_media" ON storage.objects;

CREATE POLICY "Anyone can delete media" ON storage.objects FOR DELETE TO public USING ((bucket_id = 'media'::text));
CREATE POLICY "Anyone can delete media files" ON storage.objects FOR DELETE TO public USING ((bucket_id = 'media'::text));
CREATE POLICY "Anyone can update character avatars" ON storage.objects FOR UPDATE TO public USING (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = 'character-avatars'::text)));
CREATE POLICY "Anyone can update media" ON storage.objects FOR UPDATE TO public USING ((bucket_id = 'media'::text));
CREATE POLICY "Anyone can update media files" ON storage.objects FOR UPDATE TO public USING ((bucket_id = 'media'::text));
CREATE POLICY "Anyone can upload character avatars" ON storage.objects FOR INSERT TO public WITH CHECK (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = 'character-avatars'::text)));
CREATE POLICY "Anyone can upload media" ON storage.objects FOR INSERT TO public WITH CHECK ((bucket_id = 'media'::text));
CREATE POLICY "Anyone can upload to media bucket" ON storage.objects FOR INSERT TO public WITH CHECK ((bucket_id = 'media'::text));
CREATE POLICY "Anyone can view character avatars" ON storage.objects FOR SELECT TO public USING (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = 'character-avatars'::text)));
CREATE POLICY "Anyone can view media files" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'media'::text));
CREATE POLICY "Public media access" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'media'::text));
