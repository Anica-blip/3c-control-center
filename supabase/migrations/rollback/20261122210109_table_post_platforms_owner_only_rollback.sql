-- Rollback for 20261122210109_table_post_platforms_owner_only.sql
-- Restores the rules on public.post_platforms exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_post_platforms" ON public.post_platforms;
DROP POLICY IF EXISTS "owner_insert_post_platforms" ON public.post_platforms;
DROP POLICY IF EXISTS "owner_update_post_platforms" ON public.post_platforms;
DROP POLICY IF EXISTS "owner_delete_post_platforms" ON public.post_platforms;

CREATE POLICY "Allow all operations on post_platforms" ON public.post_platforms AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.post_platforms AS PERMISSIVE FOR ALL TO PUBLIC USING (true);
