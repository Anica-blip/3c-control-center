-- 3C Control Center - table lock-down: public.keywords -> owner only (is_owner())
-- Rollback: rollback/20261122210121_table_keywords_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'keywords' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'keywords');
  END LOOP;
END
$m$;

ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_keywords" ON public.keywords FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_keywords" ON public.keywords FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_keywords" ON public.keywords FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_keywords" ON public.keywords FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
