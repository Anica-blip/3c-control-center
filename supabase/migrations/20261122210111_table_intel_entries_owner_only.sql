-- 3C Control Center - table lock-down: public.intel_entries -> owner only (is_owner())
-- Rollback: rollback/20261122210111_table_intel_entries_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'intel_entries' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'intel_entries');
  END LOOP;
END
$m$;

ALTER TABLE public.intel_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_intel_entries" ON public.intel_entries FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_intel_entries" ON public.intel_entries FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_intel_entries" ON public.intel_entries FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_intel_entries" ON public.intel_entries FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
