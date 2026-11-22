-- Rollback for 20261122210131_table_telegram_configurations_owner_only.sql
-- Restores the rules on public.telegram_configurations exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_telegram_configurations" ON public.telegram_configurations;
DROP POLICY IF EXISTS "owner_insert_telegram_configurations" ON public.telegram_configurations;
DROP POLICY IF EXISTS "owner_update_telegram_configurations" ON public.telegram_configurations;
DROP POLICY IF EXISTS "owner_delete_telegram_configurations" ON public.telegram_configurations;

CREATE POLICY "Allow all operations on telegram_configurations" ON public.telegram_configurations AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access on telegram_configurations" ON public.telegram_configurations AS PERMISSIVE FOR DELETE TO anon USING (true);
CREATE POLICY "Allow anonymous insert access on telegram_configurations" ON public.telegram_configurations AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read access on telegram_configurations" ON public.telegram_configurations AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous update access on telegram_configurations" ON public.telegram_configurations AS PERMISSIVE FOR UPDATE TO anon USING (true) WITH CHECK (true);
