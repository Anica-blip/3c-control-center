-- 3C Control Center - table lock-down: public.pending_content_library -> owner only (is_owner())
-- Rollback: rollback/20261122210134_table_pending_content_library_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pending_content_library' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'pending_content_library');
  END LOOP;
END
$m$;

ALTER TABLE public.pending_content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_pending_content_library" ON public.pending_content_library FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_pending_content_library" ON public.pending_content_library FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_pending_content_library" ON public.pending_content_library FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_pending_content_library" ON public.pending_content_library FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
