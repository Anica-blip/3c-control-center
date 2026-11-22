-- Rollback for 20261122210104_table_caelum_messages_owner_only.sql
-- Restores the rules on public.caelum_messages exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_caelum_messages" ON public.caelum_messages;
DROP POLICY IF EXISTS "owner_insert_caelum_messages" ON public.caelum_messages;
DROP POLICY IF EXISTS "owner_update_caelum_messages" ON public.caelum_messages;
DROP POLICY IF EXISTS "owner_delete_caelum_messages" ON public.caelum_messages;

CREATE POLICY "auth_messages" ON public.caelum_messages AS PERMISSIVE FOR ALL TO authenticated USING (true);
