-- Rollback for 20261122210101_table_caelum_decisions_owner_only.sql
-- Restores the rules on public.caelum_decisions exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_caelum_decisions" ON public.caelum_decisions;
DROP POLICY IF EXISTS "owner_insert_caelum_decisions" ON public.caelum_decisions;
DROP POLICY IF EXISTS "owner_update_caelum_decisions" ON public.caelum_decisions;
DROP POLICY IF EXISTS "owner_delete_caelum_decisions" ON public.caelum_decisions;

CREATE POLICY "auth only" ON public.caelum_decisions AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
