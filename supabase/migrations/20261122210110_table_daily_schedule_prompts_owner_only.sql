-- 3C Control Center - table lock-down: public.daily_schedule_prompts -> owner only (is_owner())
-- Rollback: rollback/20261122210110_table_daily_schedule_prompts_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_schedule_prompts' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'daily_schedule_prompts');
  END LOOP;
END
$m$;

ALTER TABLE public.daily_schedule_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_daily_schedule_prompts" ON public.daily_schedule_prompts FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_daily_schedule_prompts" ON public.daily_schedule_prompts FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_daily_schedule_prompts" ON public.daily_schedule_prompts FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_daily_schedule_prompts" ON public.daily_schedule_prompts FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
