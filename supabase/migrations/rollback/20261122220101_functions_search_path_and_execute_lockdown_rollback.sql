-- Rollback for 20261122220101_functions_search_path_and_execute_lockdown.sql
-- Restores: no fixed search path (as before) on the 28 functions that had none, the original
-- increment_template_usage body, and the original run permissions read on 22 Nov 2026.
-- Note: schedule_post already had search_path = '' before and is left as it was.

DO $m$ DECLARE f record; BEGIN
  FOR f IN SELECT p.oid FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.prokind = 'f'
    AND p.proname IN ('auto_fix_required_fields','cleanup_failed_screenshots','copy_full_content_post_to_scheduled','copy_to_scheduled_posts','fix_null_user_ids','fn_content_posts_auto_populate','get_platform_icon','handle_dashboard_posts_soft_delete','increment_screenshot_usage','is_authorized_log_viewer','mark_screenshot_completed','mark_screenshot_failed','populate_scheduled_post_from_content','prevent_duplicate_content_id','prevent_duplicate_content_id_on_insert','set_content_post_type_from_telegram','set_default_user_id','sync_external_service_name_to_posts','sync_telegram_type_to_content_posts','tf_set_platform_icon_content_posts','tf_set_platform_icon_dashboard_platform_assignments','tf_set_platform_icon_dashboard_posts','update_dashboard_posts_updated_at','update_modified_column','update_posting_status_to_sent','update_screenshots_updated_at','update_updated_at','update_updated_at_column') LOOP
    EXECUTE format('ALTER FUNCTION %s RESET search_path', f.oid::regprocedure);
  END LOOP;
END $m$;

-- original body of increment_template_usage (no owner check, no search_path)
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $f$
BEGIN
  UPDATE dashboard_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$f$;
ALTER FUNCTION public.increment_template_usage(uuid) RESET search_path;

-- original run permissions
GRANT EXECUTE ON FUNCTION public.fix_null_user_ids() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_content_posts_auto_populate() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_template_usage(uuid) TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_authorized_log_viewer() TO PUBLIC, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.populate_scheduled_post_from_content() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.schedule_post() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_default_user_id() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_external_service_name_to_posts() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_modified_column() TO PUBLIC, anon, authenticated, service_role;
