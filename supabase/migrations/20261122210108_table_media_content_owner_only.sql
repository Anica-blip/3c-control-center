-- 3C Control Center - table lock-down: public.media_content -> owner only (is_owner())
-- Rollback: rollback/20261122210108_table_media_content_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'media_content' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'media_content');
  END LOOP;
END
$m$;

ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_media_content" ON public.media_content FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_media_content" ON public.media_content FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_media_content" ON public.media_content FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_media_content" ON public.media_content FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
