-- Repo path: supabase/migrations/20261122190101_storage_marketing_assets_owner_only.sql
-- Storage bucket 'marketing-assets': owner only (Standard B9). Project: 3C Control Center.
-- Files stay viewable by their address (the bucket stays public). No rule is left that lets
-- visitors list, upload, replace or delete. Rollback: rollback/20261122190101_storage_marketing_assets_owner_only.sql

DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 121yfpm_0" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 121yfpm_1" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 121yfpm_2" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 121yfpm_3" ON storage.objects;

CREATE POLICY "owner_select_marketing_assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'marketing-assets' AND (SELECT public.is_owner()));
CREATE POLICY "owner_insert_marketing_assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'marketing-assets' AND (SELECT public.is_owner()));
CREATE POLICY "owner_update_marketing_assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'marketing-assets' AND (SELECT public.is_owner())) WITH CHECK (bucket_id = 'marketing-assets' AND (SELECT public.is_owner()));
CREATE POLICY "owner_delete_marketing_assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'marketing-assets' AND (SELECT public.is_owner()));
