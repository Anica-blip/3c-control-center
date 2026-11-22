-- Rollback for 20261122210121_table_keywords_owner_only.sql
-- Restores the rules on public.keywords exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_keywords" ON public.keywords;
DROP POLICY IF EXISTS "owner_insert_keywords" ON public.keywords;
DROP POLICY IF EXISTS "owner_update_keywords" ON public.keywords;
DROP POLICY IF EXISTS "owner_delete_keywords" ON public.keywords;

CREATE POLICY "Allow authenticated full access" ON public.keywords AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
