-- 3C Control Center - table lock-down: public.brand_assets_metadata -> owner only (is_owner())
-- Rollback: rollback/20261122210107_table_brand_assets_metadata_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'brand_assets_metadata' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'brand_assets_metadata');
  END LOOP;
END
$m$;

ALTER TABLE public.brand_assets_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_brand_assets_metadata" ON public.brand_assets_metadata FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_brand_assets_metadata" ON public.brand_assets_metadata FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_brand_assets_metadata" ON public.brand_assets_metadata FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_brand_assets_metadata" ON public.brand_assets_metadata FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
