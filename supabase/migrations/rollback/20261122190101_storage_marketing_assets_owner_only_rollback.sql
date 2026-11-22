-- Repo path: supabase/migrations/rollback/20261122190101_storage_marketing_assets_owner_only_rollback.sql
-- Puts back the rules that bucket 'marketing-assets' had on 22 Nov 2026 (they were open to visitors).
-- Only run this to undo 20261122190101_storage_marketing_assets_owner_only.sql.

DROP POLICY IF EXISTS "owner_select_marketing_assets" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_marketing_assets" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_marketing_assets" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_marketing_assets" ON storage.objects;

CREATE POLICY "Give anon users access to JPG images in folder 121yfpm_0" ON storage.objects FOR SELECT TO public USING (((bucket_id = 'marketing-assets'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
CREATE POLICY "Give anon users access to JPG images in folder 121yfpm_1" ON storage.objects FOR INSERT TO public WITH CHECK (((bucket_id = 'marketing-assets'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
CREATE POLICY "Give anon users access to JPG images in folder 121yfpm_2" ON storage.objects FOR UPDATE TO public USING (((bucket_id = 'marketing-assets'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
CREATE POLICY "Give anon users access to JPG images in folder 121yfpm_3" ON storage.objects FOR DELETE TO public USING (((bucket_id = 'marketing-assets'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
