-- Rollback for 20261122210132_table_external_services_owner_only.sql
-- Restores the rules on public.external_services exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_external_services" ON public.external_services;
DROP POLICY IF EXISTS "owner_insert_external_services" ON public.external_services;
DROP POLICY IF EXISTS "owner_update_external_services" ON public.external_services;
DROP POLICY IF EXISTS "owner_delete_external_services" ON public.external_services;

CREATE POLICY "Allow all operations on external_services" ON public.external_services AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete their own external services" ON public.external_services AS PERMISSIVE FOR DELETE TO PUBLIC USING (((auth.uid() = user_id) OR (user_id IS NULL)));
CREATE POLICY "Users can insert their own external services" ON public.external_services AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((auth.uid() = user_id) OR (user_id IS NULL)));
CREATE POLICY "Users can update their own external services" ON public.external_services AS PERMISSIVE FOR UPDATE TO PUBLIC USING (((auth.uid() = user_id) OR (user_id IS NULL)));
CREATE POLICY "Users can view their own external services" ON public.external_services AS PERMISSIVE FOR SELECT TO PUBLIC USING (((auth.uid() = user_id) OR (user_id IS NULL)));
