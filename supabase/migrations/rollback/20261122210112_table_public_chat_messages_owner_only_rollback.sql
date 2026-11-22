-- Rollback for 20261122210112_table_public_chat_messages_owner_only.sql
-- Restores the rules on public.public_chat_messages exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_public_chat_messages" ON public.public_chat_messages;
DROP POLICY IF EXISTS "owner_insert_public_chat_messages" ON public.public_chat_messages;
DROP POLICY IF EXISTS "owner_update_public_chat_messages" ON public.public_chat_messages;
DROP POLICY IF EXISTS "owner_delete_public_chat_messages" ON public.public_chat_messages;
DROP POLICY IF EXISTS "visitor_insert_public_chat_messages" ON public.public_chat_messages;

CREATE POLICY "Public chat messages can be created by anyone" ON public.public_chat_messages AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY "Public chat messages can be viewed by anyone" ON public.public_chat_messages AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
