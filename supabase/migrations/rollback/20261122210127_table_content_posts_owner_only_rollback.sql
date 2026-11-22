-- Rollback for 20261122210127_table_content_posts_owner_only.sql
-- Restores the rules on public.content_posts exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_content_posts" ON public.content_posts;
DROP POLICY IF EXISTS "owner_insert_content_posts" ON public.content_posts;
DROP POLICY IF EXISTS "owner_update_content_posts" ON public.content_posts;
DROP POLICY IF EXISTS "owner_delete_content_posts" ON public.content_posts;

CREATE POLICY "Allow all operations on content_posts" ON public.content_posts AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow insert for system and authenticated users" ON public.content_posts AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid)));
CREATE POLICY "Allow select for system and authenticated users" ON public.content_posts AS PERMISSIVE FOR SELECT TO anon, authenticated USING (((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid) OR (user_id IS NULL)));
CREATE POLICY "Users can delete their own content posts" ON public.content_posts AS PERMISSIVE FOR DELETE TO PUBLIC USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Users can update their own content posts" ON public.content_posts AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() = user_id));
