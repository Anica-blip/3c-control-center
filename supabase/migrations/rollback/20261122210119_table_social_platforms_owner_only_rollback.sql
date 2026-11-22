-- Rollback for 20261122210119_table_social_platforms_owner_only.sql
-- Restores the rules on public.social_platforms exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_social_platforms" ON public.social_platforms;
DROP POLICY IF EXISTS "owner_insert_social_platforms" ON public.social_platforms;
DROP POLICY IF EXISTS "owner_update_social_platforms" ON public.social_platforms;
DROP POLICY IF EXISTS "owner_delete_social_platforms" ON public.social_platforms;

CREATE POLICY "Allow all operations on social_platforms" ON public.social_platforms AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access on social_platforms" ON public.social_platforms AS PERMISSIVE FOR DELETE TO anon USING (true);
CREATE POLICY "Allow anonymous insert access on social_platforms" ON public.social_platforms AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read access on social_platforms" ON public.social_platforms AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous update access on social_platforms" ON public.social_platforms AS PERMISSIVE FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.social_platforms AS PERMISSIVE FOR ALL TO authenticated USING (true);
