-- Repo path: supabase/migrations/20261122190104_storage_brand_assets_owner_only.sql
-- Storage bucket 'brand-assets': owner only (Standard B9). Project: 3C Control Center.
-- Files stay viewable by their address (the bucket stays public). No rule is left that lets
-- visitors list, upload, replace or delete. Rollback: rollback/20261122190104_storage_brand_assets_owner_only.sql

DROP POLICY IF EXISTS "Authenticated delete brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for brand assets" ON storage.objects;

CREATE POLICY "owner_select_brand_assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'brand-assets' AND (SELECT public.is_owner()));
CREATE POLICY "owner_insert_brand_assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-assets' AND (SELECT public.is_owner()));
CREATE POLICY "owner_update_brand_assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand-assets' AND (SELECT public.is_owner())) WITH CHECK (bucket_id = 'brand-assets' AND (SELECT public.is_owner()));
CREATE POLICY "owner_delete_brand_assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-assets' AND (SELECT public.is_owner()));
