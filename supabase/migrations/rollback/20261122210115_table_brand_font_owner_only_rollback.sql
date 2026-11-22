-- Rollback for 20261122210115_table_brand_font_owner_only.sql
-- Restores the rules on public.brand_font exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_brand_font" ON public.brand_font;
DROP POLICY IF EXISTS "owner_insert_brand_font" ON public.brand_font;
DROP POLICY IF EXISTS "owner_update_brand_font" ON public.brand_font;
DROP POLICY IF EXISTS "owner_delete_brand_font" ON public.brand_font;

CREATE POLICY "Allow all operations" ON public.brand_font AS PERMISSIVE FOR ALL TO PUBLIC USING (true);
CREATE POLICY "Authenticated users can delete brand fonts" ON public.brand_font AS PERMISSIVE FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert brand fonts" ON public.brand_font AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update brand fonts" ON public.brand_font AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can view brand fonts" ON public.brand_font AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can delete brand fonts" ON public.brand_font AS PERMISSIVE FOR DELETE TO PUBLIC USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can insert brand fonts" ON public.brand_font AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can update brand fonts" ON public.brand_font AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can view brand fonts" ON public.brand_font AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
