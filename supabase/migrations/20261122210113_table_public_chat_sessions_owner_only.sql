-- 3C Control Center - table lock-down: public.public_chat_sessions -> owner only (is_owner())
-- Rollback: rollback/20261122210113_table_public_chat_sessions_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'public_chat_sessions' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'public_chat_sessions');
  END LOOP;
END
$m$;

ALTER TABLE public.public_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_public_chat_sessions" ON public.public_chat_sessions FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_public_chat_sessions" ON public.public_chat_sessions FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_public_chat_sessions" ON public.public_chat_sessions FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_public_chat_sessions" ON public.public_chat_sessions FOR DELETE TO authenticated USING ((SELECT public.is_owner()));

-- Visitors may add (insert) only; only the owner reads, changes or deletes.
CREATE POLICY "visitor_insert_public_chat_sessions" ON public.public_chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (char_length(session_id) BETWEEN 1 AND 200 AND coalesce(char_length(user_identifier), 0) <= 200);
