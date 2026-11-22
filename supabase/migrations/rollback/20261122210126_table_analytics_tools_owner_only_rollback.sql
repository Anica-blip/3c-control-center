-- Rollback for 20261122210126_table_analytics_tools_owner_only.sql
-- Restores the rules on public.analytics_tools exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_analytics_tools" ON public.analytics_tools;
DROP POLICY IF EXISTS "owner_insert_analytics_tools" ON public.analytics_tools;
DROP POLICY IF EXISTS "owner_update_analytics_tools" ON public.analytics_tools;
DROP POLICY IF EXISTS "owner_delete_analytics_tools" ON public.analytics_tools;

CREATE POLICY "Allow authenticated full access" ON public.analytics_tools AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
