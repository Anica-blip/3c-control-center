-- 3C Control Center - table lock-down: public.marketing_intel -> owner only (is_owner())
-- Rollback: rollback/20261122210124_table_marketing_intel_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'marketing_intel' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'marketing_intel');
  END LOOP;
END
$m$;

ALTER TABLE public.marketing_intel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_marketing_intel" ON public.marketing_intel FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_marketing_intel" ON public.marketing_intel FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_marketing_intel" ON public.marketing_intel FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_marketing_intel" ON public.marketing_intel FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
