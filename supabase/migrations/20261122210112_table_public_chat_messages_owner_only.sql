-- 3C Control Center - table lock-down: public.public_chat_messages -> owner only (is_owner())
-- Rollback: rollback/20261122210112_table_public_chat_messages_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'public_chat_messages' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'public_chat_messages');
  END LOOP;
END
$m$;

ALTER TABLE public.public_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_public_chat_messages" ON public.public_chat_messages FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_public_chat_messages" ON public.public_chat_messages FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_public_chat_messages" ON public.public_chat_messages FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_public_chat_messages" ON public.public_chat_messages FOR DELETE TO authenticated USING ((SELECT public.is_owner()));

-- Visitors may add (insert) only; only the owner reads, changes or deletes.
CREATE POLICY "visitor_insert_public_chat_messages" ON public.public_chat_messages FOR INSERT TO anon, authenticated WITH CHECK (char_length(user_message) BETWEEN 1 AND 4000);
