-- Rollback for 20261122210116_table_brand_guidelines_owner_only.sql
-- Restores the rules on public.brand_guidelines exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_brand_guidelines" ON public.brand_guidelines;
DROP POLICY IF EXISTS "owner_insert_brand_guidelines" ON public.brand_guidelines;
DROP POLICY IF EXISTS "owner_update_brand_guidelines" ON public.brand_guidelines;
DROP POLICY IF EXISTS "owner_delete_brand_guidelines" ON public.brand_guidelines;

CREATE POLICY "Allow all operations" ON public.brand_guidelines AS PERMISSIVE FOR ALL TO PUBLIC USING (true);
CREATE POLICY "Authenticated users can delete brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can view brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.brand_guidelines AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can delete brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR DELETE TO PUBLIC USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can insert brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can update brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can view brand guidelines" ON public.brand_guidelines AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
