-- 3C Control Center - table lock-down: public.dashboard_platform_assignments -> owner only (is_owner())
-- Rollback: rollback/20261122210130_table_dashboard_platform_assignments_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dashboard_platform_assignments' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'dashboard_platform_assignments');
  END LOOP;
END
$m$;

ALTER TABLE public.dashboard_platform_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_dashboard_platform_assignments" ON public.dashboard_platform_assignments FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_dashboard_platform_assignments" ON public.dashboard_platform_assignments FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_dashboard_platform_assignments" ON public.dashboard_platform_assignments FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_dashboard_platform_assignments" ON public.dashboard_platform_assignments FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
