-- 3C Control Center - public.dashboard_posts: add an owner read rule (additive)
-- Rollback: rollback/20261122210135_table_dashboard_posts_owner_read_rollback.sql
-- Existing rules are NOT touched. Without this the owner login saw 0 rows, because the old rules
-- compare auth.uid() with the row's user_id and existing rows carry the placeholder id.

CREATE POLICY "owner_select_dashboard_posts" ON public.dashboard_posts FOR SELECT TO authenticated USING ((SELECT public.is_owner()));
