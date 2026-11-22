-- 3C Control Center - table lock-down: public.character_profiles -> owner only (is_owner())
-- Rollback: rollback/20261122210118_table_character_profiles_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'character_profiles' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'character_profiles');
  END LOOP;
END
$m$;

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_character_profiles" ON public.character_profiles FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_character_profiles" ON public.character_profiles FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_character_profiles" ON public.character_profiles FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_character_profiles" ON public.character_profiles FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
