-- 3C Control Center - table lock-down: public.caelum_files -> owner only (is_owner())
-- Rollback: rollback/20261122210102_table_caelum_files_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'caelum_files' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'caelum_files');
  END LOOP;
END
$m$;

ALTER TABLE public.caelum_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_caelum_files" ON public.caelum_files FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_caelum_files" ON public.caelum_files FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_caelum_files" ON public.caelum_files FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_caelum_files" ON public.caelum_files FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
