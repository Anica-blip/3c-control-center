-- Repo path: supabase/migrations/20261122190107_storage_content_media_owner_only.sql
-- Storage bucket 'content-media': owner only (Standard B9). Project: 3C Control Center.
-- Files stay viewable by their address (the bucket stays public). No rule is left that lets
-- visitors list, upload, replace or delete. Rollback: rollback/20261122190107_storage_content_media_owner_only.sql

DROP POLICY IF EXISTS "Authenticated delete content media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update content media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to content media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for content media" ON storage.objects;

CREATE POLICY "owner_select_content_media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'content-media' AND (SELECT public.is_owner()));
CREATE POLICY "owner_insert_content_media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content-media' AND (SELECT public.is_owner()));
CREATE POLICY "owner_update_content_media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'content-media' AND (SELECT public.is_owner())) WITH CHECK (bucket_id = 'content-media' AND (SELECT public.is_owner()));
CREATE POLICY "owner_delete_content_media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'content-media' AND (SELECT public.is_owner()));
