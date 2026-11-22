-- 3C Control Center - table lock-down: public.post_platforms -> owner only (is_owner())
-- Rollback: rollback/20261122210109_table_post_platforms_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_platforms' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'post_platforms');
  END LOOP;
END
$m$;

ALTER TABLE public.post_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_post_platforms" ON public.post_platforms FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_post_platforms" ON public.post_platforms FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_post_platforms" ON public.post_platforms FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_post_platforms" ON public.post_platforms FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
