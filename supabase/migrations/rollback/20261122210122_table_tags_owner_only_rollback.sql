-- Rollback for 20261122210122_table_tags_owner_only.sql
-- Restores the rules on public.tags exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_tags" ON public.tags;
DROP POLICY IF EXISTS "owner_insert_tags" ON public.tags;
DROP POLICY IF EXISTS "owner_update_tags" ON public.tags;
DROP POLICY IF EXISTS "owner_delete_tags" ON public.tags;

CREATE POLICY "Allow authenticated full access" ON public.tags AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
