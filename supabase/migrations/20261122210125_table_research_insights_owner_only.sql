-- 3C Control Center - table lock-down: public.research_insights -> owner only (is_owner())
-- Rollback: rollback/20261122210125_table_research_insights_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'research_insights' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'research_insights');
  END LOOP;
END
$m$;

ALTER TABLE public.research_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_research_insights" ON public.research_insights FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_research_insights" ON public.research_insights FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_research_insights" ON public.research_insights FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_research_insights" ON public.research_insights FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
