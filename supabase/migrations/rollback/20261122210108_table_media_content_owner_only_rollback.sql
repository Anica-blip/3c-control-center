-- Rollback for 20261122210108_table_media_content_owner_only.sql
-- Restores the rules on public.media_content exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_media_content" ON public.media_content;
DROP POLICY IF EXISTS "owner_insert_media_content" ON public.media_content;
DROP POLICY IF EXISTS "owner_update_media_content" ON public.media_content;
DROP POLICY IF EXISTS "owner_delete_media_content" ON public.media_content;

CREATE POLICY "Allow all operations on media_content" ON public.media_content AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.media_content AS PERMISSIVE FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_read_media_content" ON public.media_content AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.role() = 'authenticated'::text));
