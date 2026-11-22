-- Rollback for 20261122210135_table_dashboard_posts_owner_read.sql
DROP POLICY IF EXISTS "owner_select_dashboard_posts" ON public.dashboard_posts;
