-- Rollback for 20261122210125_table_research_insights_owner_only.sql
-- Restores the rules on public.research_insights exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_research_insights" ON public.research_insights;
DROP POLICY IF EXISTS "owner_insert_research_insights" ON public.research_insights;
DROP POLICY IF EXISTS "owner_update_research_insights" ON public.research_insights;
DROP POLICY IF EXISTS "owner_delete_research_insights" ON public.research_insights;

CREATE POLICY "Allow authenticated full access" ON public.research_insights AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
