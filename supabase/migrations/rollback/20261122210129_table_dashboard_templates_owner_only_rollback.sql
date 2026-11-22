-- Rollback for 20261122210129_table_dashboard_templates_owner_only.sql
-- Restores the rules on public.dashboard_templates exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_dashboard_templates" ON public.dashboard_templates;
DROP POLICY IF EXISTS "owner_insert_dashboard_templates" ON public.dashboard_templates;
DROP POLICY IF EXISTS "owner_update_dashboard_templates" ON public.dashboard_templates;
DROP POLICY IF EXISTS "owner_delete_dashboard_templates" ON public.dashboard_templates;

CREATE POLICY "dashboard_templates_basic_access" ON public.dashboard_templates AS PERMISSIVE FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
