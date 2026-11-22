-- Rollback for 20261122210124_table_marketing_intel_owner_only.sql
-- Restores the rules on public.marketing_intel exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_marketing_intel" ON public.marketing_intel;
DROP POLICY IF EXISTS "owner_insert_marketing_intel" ON public.marketing_intel;
DROP POLICY IF EXISTS "owner_update_marketing_intel" ON public.marketing_intel;
DROP POLICY IF EXISTS "owner_delete_marketing_intel" ON public.marketing_intel;

CREATE POLICY "Allow authenticated full access" ON public.marketing_intel AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
