-- Rollback for 20261122210130_table_dashboard_platform_assignments_owner_only.sql
-- Restores the rules on public.dashboard_platform_assignments exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_dashboard_platform_assignments" ON public.dashboard_platform_assignments;
DROP POLICY IF EXISTS "owner_insert_dashboard_platform_assignments" ON public.dashboard_platform_assignments;
DROP POLICY IF EXISTS "owner_update_dashboard_platform_assignments" ON public.dashboard_platform_assignments;
DROP POLICY IF EXISTS "owner_delete_dashboard_platform_assignments" ON public.dashboard_platform_assignments;

CREATE POLICY "Allow all operations on dashboard_platform_assignments" ON public.dashboard_platform_assignments AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users" ON public.dashboard_platform_assignments AS PERMISSIVE FOR SELECT TO anon, authenticated, service_role USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Allow service_role FULL ACCESS" ON public.dashboard_platform_assignments AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING ((( SELECT auth.uid() AS uid) = user_id));
