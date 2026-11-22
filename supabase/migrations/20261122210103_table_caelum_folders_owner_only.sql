-- 3C Control Center - table lock-down: public.caelum_folders -> owner only (is_owner())
-- Rollback: rollback/20261122210103_table_caelum_folders_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'caelum_folders' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'caelum_folders');
  END LOOP;
END
$m$;

ALTER TABLE public.caelum_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_caelum_folders" ON public.caelum_folders FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_caelum_folders" ON public.caelum_folders FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_caelum_folders" ON public.caelum_folders FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_caelum_folders" ON public.caelum_folders FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
