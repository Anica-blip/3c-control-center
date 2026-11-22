-- 3C Control Center - table lock-down: public.brand_colors -> owner only (is_owner())
-- Rollback: rollback/20261122210114_table_brand_colors_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'brand_colors' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'brand_colors');
  END LOOP;
END
$m$;

ALTER TABLE public.brand_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_brand_colors" ON public.brand_colors FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_brand_colors" ON public.brand_colors FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_brand_colors" ON public.brand_colors FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_brand_colors" ON public.brand_colors FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
