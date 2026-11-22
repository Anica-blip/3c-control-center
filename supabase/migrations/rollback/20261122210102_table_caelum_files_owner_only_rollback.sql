-- Rollback for 20261122210102_table_caelum_files_owner_only.sql
-- Restores the rules on public.caelum_files exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_caelum_files" ON public.caelum_files;
DROP POLICY IF EXISTS "owner_insert_caelum_files" ON public.caelum_files;
DROP POLICY IF EXISTS "owner_update_caelum_files" ON public.caelum_files;
DROP POLICY IF EXISTS "owner_delete_caelum_files" ON public.caelum_files;

CREATE POLICY "auth_files" ON public.caelum_files AS PERMISSIVE FOR ALL TO authenticated USING (true);
