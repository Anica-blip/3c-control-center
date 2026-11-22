-- 3C Control Center - table lock-down: public.external_services -> owner only (is_owner())
-- Rollback: rollback/20261122210132_table_external_services_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'external_services' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'external_services');
  END LOOP;
END
$m$;

ALTER TABLE public.external_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_external_services" ON public.external_services FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_external_services" ON public.external_services FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_external_services" ON public.external_services FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_external_services" ON public.external_services FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
