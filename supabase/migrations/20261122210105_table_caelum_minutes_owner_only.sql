-- 3C Control Center - table lock-down: public.caelum_minutes -> owner only (is_owner())
-- Rollback: rollback/20261122210105_table_caelum_minutes_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'caelum_minutes' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'caelum_minutes');
  END LOOP;
END
$m$;

ALTER TABLE public.caelum_minutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_caelum_minutes" ON public.caelum_minutes FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_caelum_minutes" ON public.caelum_minutes FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_caelum_minutes" ON public.caelum_minutes FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_caelum_minutes" ON public.caelum_minutes FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
