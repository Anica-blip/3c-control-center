-- Rollback for 20261122210120_table_personas_owner_only.sql
-- Restores the rules on public.personas exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_personas" ON public.personas;
DROP POLICY IF EXISTS "owner_insert_personas" ON public.personas;
DROP POLICY IF EXISTS "owner_update_personas" ON public.personas;
DROP POLICY IF EXISTS "owner_delete_personas" ON public.personas;

CREATE POLICY "Allow all operations on personas" ON public.personas AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON public.personas AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
