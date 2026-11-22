-- 3C Control Center - table lock-down: public.tags -> owner only (is_owner())
-- Rollback: rollback/20261122210122_table_tags_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tags' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'tags');
  END LOOP;
END
$m$;

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_tags" ON public.tags FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_tags" ON public.tags FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_tags" ON public.tags FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_tags" ON public.tags FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
