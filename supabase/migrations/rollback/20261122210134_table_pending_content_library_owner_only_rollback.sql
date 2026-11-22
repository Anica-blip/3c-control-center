-- Rollback for 20261122210134_table_pending_content_library_owner_only.sql
-- Restores the rules on public.pending_content_library exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_pending_content_library" ON public.pending_content_library;
DROP POLICY IF EXISTS "owner_insert_pending_content_library" ON public.pending_content_library;
DROP POLICY IF EXISTS "owner_update_pending_content_library" ON public.pending_content_library;
DROP POLICY IF EXISTS "owner_delete_pending_content_library" ON public.pending_content_library;

CREATE POLICY "Allow all operations on pending_content_library" ON public.pending_content_library AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete pending content" ON public.pending_content_library AS PERMISSIVE FOR DELETE TO PUBLIC USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Authenticated users can insert pending content" ON public.pending_content_library AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((( SELECT auth.uid() AS uid) IS NOT NULL));
CREATE POLICY "Authenticated users can update pending content" ON public.pending_content_library AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Authenticated users can view pending content" ON public.pending_content_library AS PERMISSIVE FOR SELECT TO PUBLIC USING ((( SELECT auth.uid() AS uid) = user_id));
