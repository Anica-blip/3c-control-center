-- Rollback for 20261122210114_table_brand_colors_owner_only.sql
-- Restores the rules on public.brand_colors exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_brand_colors" ON public.brand_colors;
DROP POLICY IF EXISTS "owner_insert_brand_colors" ON public.brand_colors;
DROP POLICY IF EXISTS "owner_update_brand_colors" ON public.brand_colors;
DROP POLICY IF EXISTS "owner_delete_brand_colors" ON public.brand_colors;

CREATE POLICY "Allow all operations" ON public.brand_colors AS PERMISSIVE FOR ALL TO PUBLIC USING (true);
CREATE POLICY "Allow authenticated delete" ON public.brand_colors AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.brand_colors AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated read" ON public.brand_colors AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update" ON public.brand_colors AS PERMISSIVE FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete brand colors" ON public.brand_colors AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert brand colors" ON public.brand_colors AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update brand colors" ON public.brand_colors AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can view brand colors" ON public.brand_colors AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.brand_colors AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can delete brand colors" ON public.brand_colors AS PERMISSIVE FOR DELETE TO PUBLIC USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can insert brand colors" ON public.brand_colors AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can update brand colors" ON public.brand_colors AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can view brand colors" ON public.brand_colors AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
