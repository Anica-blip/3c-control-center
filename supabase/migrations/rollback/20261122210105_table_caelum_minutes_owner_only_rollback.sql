-- Rollback for 20261122210105_table_caelum_minutes_owner_only.sql
-- Restores the rules on public.caelum_minutes exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_caelum_minutes" ON public.caelum_minutes;
DROP POLICY IF EXISTS "owner_insert_caelum_minutes" ON public.caelum_minutes;
DROP POLICY IF EXISTS "owner_update_caelum_minutes" ON public.caelum_minutes;
DROP POLICY IF EXISTS "owner_delete_caelum_minutes" ON public.caelum_minutes;

CREATE POLICY "auth_minutes" ON public.caelum_minutes AS PERMISSIVE FOR ALL TO authenticated USING (true);
