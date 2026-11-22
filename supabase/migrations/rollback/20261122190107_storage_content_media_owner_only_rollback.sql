-- Repo path: supabase/migrations/rollback/20261122190107_storage_content_media_owner_only_rollback.sql
-- Puts back the rules that bucket 'content-media' had on 22 Nov 2026 (they were open to visitors).
-- Only run this to undo 20261122190107_storage_content_media_owner_only.sql.

DROP POLICY IF EXISTS "owner_select_content_media" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_content_media" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_content_media" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_content_media" ON storage.objects;

CREATE POLICY "Authenticated delete content media" ON storage.objects FOR DELETE TO public USING ((bucket_id = 'content-media'::text));
CREATE POLICY "Authenticated update content media" ON storage.objects FOR UPDATE TO public USING ((bucket_id = 'content-media'::text)) WITH CHECK ((bucket_id = 'content-media'::text));
CREATE POLICY "Authenticated upload to content media" ON storage.objects FOR INSERT TO public WITH CHECK ((bucket_id = 'content-media'::text));
CREATE POLICY "Public read access for content media" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'content-media'::text));
