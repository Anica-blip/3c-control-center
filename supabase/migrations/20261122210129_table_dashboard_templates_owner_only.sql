-- 3C Control Center - table lock-down: public.dashboard_templates -> owner only (is_owner())
-- Rollback: rollback/20261122210129_table_dashboard_templates_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dashboard_templates' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'dashboard_templates');
  END LOOP;
END
$m$;

ALTER TABLE public.dashboard_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_dashboard_templates" ON public.dashboard_templates FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_dashboard_templates" ON public.dashboard_templates FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_dashboard_templates" ON public.dashboard_templates FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_dashboard_templates" ON public.dashboard_templates FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
