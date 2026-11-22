-- Rollback for 20261122210110_table_daily_schedule_prompts_owner_only.sql
-- Restores the rules on public.daily_schedule_prompts exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_daily_schedule_prompts" ON public.daily_schedule_prompts;
DROP POLICY IF EXISTS "owner_insert_daily_schedule_prompts" ON public.daily_schedule_prompts;
DROP POLICY IF EXISTS "owner_update_daily_schedule_prompts" ON public.daily_schedule_prompts;
DROP POLICY IF EXISTS "owner_delete_daily_schedule_prompts" ON public.daily_schedule_prompts;

CREATE POLICY "Allow all operations on daily_schedule_prompts" ON public.daily_schedule_prompts AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
