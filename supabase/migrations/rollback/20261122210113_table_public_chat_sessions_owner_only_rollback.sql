-- Rollback for 20261122210113_table_public_chat_sessions_owner_only.sql
-- Restores the rules on public.public_chat_sessions exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_public_chat_sessions" ON public.public_chat_sessions;
DROP POLICY IF EXISTS "owner_insert_public_chat_sessions" ON public.public_chat_sessions;
DROP POLICY IF EXISTS "owner_update_public_chat_sessions" ON public.public_chat_sessions;
DROP POLICY IF EXISTS "owner_delete_public_chat_sessions" ON public.public_chat_sessions;
DROP POLICY IF EXISTS "visitor_insert_public_chat_sessions" ON public.public_chat_sessions;

CREATE POLICY "Public chat sessions can be created by anyone" ON public.public_chat_sessions AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY "Public chat sessions can be viewed by anyone" ON public.public_chat_sessions AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
