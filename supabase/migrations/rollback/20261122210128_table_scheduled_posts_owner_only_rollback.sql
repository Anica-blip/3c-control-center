-- Rollback for 20261122210128_table_scheduled_posts_owner_only.sql
-- Restores the rules on public.scheduled_posts exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_scheduled_posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "owner_insert_scheduled_posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "owner_update_scheduled_posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "owner_delete_scheduled_posts" ON public.scheduled_posts;

CREATE POLICY "Allow insert for system and authenticated users" ON public.scheduled_posts AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid)));
CREATE POLICY "Allow select for system and authenticated users" ON public.scheduled_posts AS PERMISSIVE FOR SELECT TO anon, authenticated USING (((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid) OR (user_id IS NULL)));
