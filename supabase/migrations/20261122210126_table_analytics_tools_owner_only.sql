-- 3C Control Center - table lock-down: public.analytics_tools -> owner only (is_owner())
-- Rollback: rollback/20261122210126_table_analytics_tools_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_tools' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'analytics_tools');
  END LOOP;
END
$m$;

ALTER TABLE public.analytics_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_analytics_tools" ON public.analytics_tools FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_analytics_tools" ON public.analytics_tools FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_analytics_tools" ON public.analytics_tools FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_analytics_tools" ON public.analytics_tools FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
