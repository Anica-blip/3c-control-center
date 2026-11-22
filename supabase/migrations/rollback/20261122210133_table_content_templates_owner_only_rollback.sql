-- Rollback for 20261122210133_table_content_templates_owner_only.sql
-- Restores the rules on public.content_templates exactly as read on 22 Nov 2026, before the lock-down.

DROP POLICY IF EXISTS "owner_select_content_templates" ON public.content_templates;
DROP POLICY IF EXISTS "owner_insert_content_templates" ON public.content_templates;
DROP POLICY IF EXISTS "owner_update_content_templates" ON public.content_templates;
DROP POLICY IF EXISTS "owner_delete_content_templates" ON public.content_templates;

CREATE POLICY "Allow all operations on content_templates" ON public.content_templates AS PERMISSIVE FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete templates" ON public.content_templates AS PERMISSIVE FOR DELETE TO PUBLIC USING (true);
CREATE POLICY "Authenticated users can insert templates" ON public.content_templates AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY "Authenticated users can update templates" ON public.content_templates AS PERMISSIVE FOR UPDATE TO PUBLIC USING (true) WITH CHECK (true);
