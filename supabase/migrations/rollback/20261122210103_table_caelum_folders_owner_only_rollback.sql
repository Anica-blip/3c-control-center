-- Rollback for 20261122210103_table_caelum_folders_owner_only.sql
-- Restores the rules on public.caelum_folders exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_caelum_folders" ON public.caelum_folders;
DROP POLICY IF EXISTS "owner_insert_caelum_folders" ON public.caelum_folders;
DROP POLICY IF EXISTS "owner_update_caelum_folders" ON public.caelum_folders;
DROP POLICY IF EXISTS "owner_delete_caelum_folders" ON public.caelum_folders;

CREATE POLICY "auth_folders" ON public.caelum_folders AS PERMISSIVE FOR ALL TO authenticated USING (true);
