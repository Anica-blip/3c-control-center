-- Rollback for 20261122210117_table_brand_logos_owner_only.sql
-- Restores the rules on public.brand_logos exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_brand_logos" ON public.brand_logos;
DROP POLICY IF EXISTS "owner_insert_brand_logos" ON public.brand_logos;
DROP POLICY IF EXISTS "owner_update_brand_logos" ON public.brand_logos;
DROP POLICY IF EXISTS "owner_delete_brand_logos" ON public.brand_logos;

CREATE POLICY "Allow all operations" ON public.brand_logos AS PERMISSIVE FOR ALL TO PUBLIC USING (true);
CREATE POLICY "Authenticated users can delete brand logos" ON public.brand_logos AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert brand logos" ON public.brand_logos AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update brand logos" ON public.brand_logos AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can view brand logos" ON public.brand_logos AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert brand logos (owner)" ON public.brand_logos AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((created_by = auth.uid()));
CREATE POLICY "Enable all operations for authenticated users" ON public.brand_logos AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can delete brand logos" ON public.brand_logos AS PERMISSIVE FOR DELETE TO PUBLIC USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can insert brand logos" ON public.brand_logos AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can update brand logos" ON public.brand_logos AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can view brand logos" ON public.brand_logos AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
