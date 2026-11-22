-- 3C Control Center - table lock-down: public.caelum_decisions -> owner only (is_owner())
-- Rollback: rollback/20261122210101_table_caelum_decisions_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'caelum_decisions' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'caelum_decisions');
  END LOOP;
END
$m$;

ALTER TABLE public.caelum_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_caelum_decisions" ON public.caelum_decisions FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_caelum_decisions" ON public.caelum_decisions FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_caelum_decisions" ON public.caelum_decisions FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_caelum_decisions" ON public.caelum_decisions FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
