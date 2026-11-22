-- 3C Control Center - table lock-down: public.content_posts -> owner only (is_owner())
-- Rollback: rollback/20261122210127_table_content_posts_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'content_posts' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'content_posts');
  END LOOP;
END
$m$;

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_content_posts" ON public.content_posts FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_content_posts" ON public.content_posts FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_content_posts" ON public.content_posts FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_content_posts" ON public.content_posts FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
