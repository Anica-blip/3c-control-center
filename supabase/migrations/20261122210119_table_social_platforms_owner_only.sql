-- 3C Control Center - table lock-down: public.social_platforms -> owner only (is_owner())
-- Rollback: rollback/20261122210119_table_social_platforms_owner_only_rollback.sql
-- Removes every existing rule on the table, then adds four owner-only rules for signed-in users.
-- Rules are not tied to row ownership (existing rows carry the placeholder owner).

DO $m$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'social_platforms' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, 'social_platforms');
  END LOOP;
END
$m$;

ALTER TABLE public.social_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_social_platforms" ON public.social_platforms FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
CREATE POLICY "owner_insert_social_platforms" ON public.social_platforms FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_update_social_platforms" ON public.social_platforms FOR UPDATE TO authenticated USING ((SELECT public.is_owner())) WITH CHECK ((SELECT public.is_owner()));
CREATE POLICY "owner_delete_social_platforms" ON public.social_platforms FOR DELETE TO authenticated USING ((SELECT public.is_owner()));
