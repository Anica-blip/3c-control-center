-- 3C Control Center - table lock-down: public.personas -> owner only (is_owner())
-- Rollback: rollback/20261122210120_table_personas_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'personas' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'personas');
  END LOOP;
END
$m$;

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_personas" ON public.personas FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_personas" ON public.personas FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_personas" ON public.personas FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_personas" ON public.personas FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
