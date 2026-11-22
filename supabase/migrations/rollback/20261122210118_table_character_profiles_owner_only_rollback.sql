-- Rollback for 20261122210118_table_character_profiles_owner_only.sql
-- Restores the rules on public.character_profiles exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_character_profiles" ON public.character_profiles;
DROP POLICY IF EXISTS "owner_insert_character_profiles" ON public.character_profiles;
DROP POLICY IF EXISTS "owner_update_character_profiles" ON public.character_profiles;
DROP POLICY IF EXISTS "owner_delete_character_profiles" ON public.character_profiles;

CREATE POLICY "Allow all operations on character_profiles" ON public.character_profiles AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access on character_profiles" ON public.character_profiles AS PERMISSIVE FOR DELETE TO anon USING (true);
CREATE POLICY "Allow anonymous insert access on character_profiles" ON public.character_profiles AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read access on character_profiles" ON public.character_profiles AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous update access on character_profiles" ON public.character_profiles AS PERMISSIVE FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to character profiles" ON public.character_profiles AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON public.character_profiles AS PERMISSIVE FOR ALL TO PUBLIC USING (true);
CREATE POLICY "authenticated_read_character_profiles" ON public.character_profiles AS PERMISSIVE FOR SELECT TO PUBLIC USING ((auth.role() = 'authenticated'::text));
