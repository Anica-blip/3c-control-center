-- 3C Control Center - table lock-down: public.content_templates -> owner only (is_owner())
-- Rollback: rollback/20261122210133_table_content_templates_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'content_templates' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'content_templates');
  END LOOP;
END
$m$;

ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_content_templates" ON public.content_templates FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_content_templates" ON public.content_templates FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_content_templates" ON public.content_templates FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_content_templates" ON public.content_templates FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
