-- Rollback for 20261122210111_table_intel_entries_owner_only.sql
-- Restores the rules on public.intel_entries exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_intel_entries" ON public.intel_entries;
DROP POLICY IF EXISTS "owner_insert_intel_entries" ON public.intel_entries;
DROP POLICY IF EXISTS "owner_update_intel_entries" ON public.intel_entries;
DROP POLICY IF EXISTS "owner_delete_intel_entries" ON public.intel_entries;

CREATE POLICY "Allow all deletes for any user" ON public.intel_entries AS PERMISSIVE FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Allow all inserts for any user" ON public.intel_entries AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all operations for any user" ON public.intel_entries AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all updates for any user" ON public.intel_entries AS PERMISSIVE FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
