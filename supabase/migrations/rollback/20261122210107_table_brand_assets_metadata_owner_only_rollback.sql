-- Rollback for 20261122210107_table_brand_assets_metadata_owner_only.sql
-- Restores the rules on public.brand_assets_metadata exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_brand_assets_metadata" ON public.brand_assets_metadata;
DROP POLICY IF EXISTS "owner_insert_brand_assets_metadata" ON public.brand_assets_metadata;
DROP POLICY IF EXISTS "owner_update_brand_assets_metadata" ON public.brand_assets_metadata;
DROP POLICY IF EXISTS "owner_delete_brand_assets_metadata" ON public.brand_assets_metadata;

CREATE POLICY "Enable all operations for authenticated users" ON public.brand_assets_metadata AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() IS NOT NULL));
