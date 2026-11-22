-- Rollback for 20261122210106_table_caelum_sessions_owner_only.sql
-- Restores the rules on public.caelum_sessions exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_caelum_sessions" ON public.caelum_sessions;
DROP POLICY IF EXISTS "owner_insert_caelum_sessions" ON public.caelum_sessions;
DROP POLICY IF EXISTS "owner_update_caelum_sessions" ON public.caelum_sessions;
DROP POLICY IF EXISTS "owner_delete_caelum_sessions" ON public.caelum_sessions;

CREATE POLICY "auth_sessions" ON public.caelum_sessions AS PERMISSIVE FOR ALL TO authenticated USING (true);
