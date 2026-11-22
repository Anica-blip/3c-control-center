-- Repo path: supabase/migrations/rollback/20261122190104_storage_brand_assets_owner_only_rollback.sql
-- Puts back the rules that bucket 'brand-assets' had on 22 Nov 2026 (they were open to visitors).
-- Only run this to undo 20261122190104_storage_brand_assets_owner_only.sql.

DROP POLICY IF EXISTS "owner_select_brand_assets" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_brand_assets" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_brand_assets" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_brand_assets" ON storage.objects;

CREATE POLICY "Authenticated delete brand assets" ON storage.objects FOR DELETE TO anon, authenticated, supabase_functions_admin USING ((bucket_id = 'brand-assets'::text));
CREATE POLICY "Authenticated update brand assets" ON storage.objects FOR UPDATE TO anon, authenticated, supabase_functions_admin USING ((bucket_id = 'brand-assets'::text)) WITH CHECK ((bucket_id = 'brand-assets'::text));
CREATE POLICY "Authenticated upload to brand assets" ON storage.objects FOR INSERT TO anon, authenticated, supabase_functions_admin WITH CHECK ((bucket_id = 'brand-assets'::text));
CREATE POLICY "Public read access for brand assets" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'brand-assets'::text));
