-- 3C Control Center - table lock-down: public.telegram_configurations -> owner only (is_owner())
-- Rollback: rollback/20261122210131_table_telegram_configurations_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'telegram_configurations' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'telegram_configurations');
  END LOOP;
END
$m$;

ALTER TABLE public.telegram_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_telegram_configurations" ON public.telegram_configurations FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_telegram_configurations" ON public.telegram_configurations FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_telegram_configurations" ON public.telegram_configurations FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_telegram_configurations" ON public.telegram_configurations FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
