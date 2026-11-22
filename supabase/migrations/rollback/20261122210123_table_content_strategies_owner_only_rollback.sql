-- Rollback for 20261122210123_table_content_strategies_owner_only.sql
-- Restores the rules on public.content_strategies exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_content_strategies" ON public.content_strategies;
DROP POLICY IF EXISTS "owner_insert_content_strategies" ON public.content_strategies;
DROP POLICY IF EXISTS "owner_update_content_strategies" ON public.content_strategies;
DROP POLICY IF EXISTS "owner_delete_content_strategies" ON public.content_strategies;

CREATE POLICY "Allow authenticated full access" ON public.content_strategies AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
