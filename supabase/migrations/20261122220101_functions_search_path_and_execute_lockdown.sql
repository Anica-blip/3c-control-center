-- 3C Control Center - functions lock-down (phase 1F)
-- Rollback: rollback/20261122220101_functions_search_path_and_execute_lockdown_rollback.sql
-- 1) fixed search path on every public function that has none (except increment_template_usage, rewritten below)
DO $m$ DECLARE f record; BEGIN
  FOR f IN SELECT p.oid FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.prokind = 'f' AND p.proconfig IS NULL AND p.proname <> 'increment_template_usage' LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', f.oid::regprocedure);
  END LOOP;
END $m$;

-- 2) increment_template_usage: owner (or the service key) only, fixed search path, schema-qualified table
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $f$
BEGIN
  IF NOT ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_owner())) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  UPDATE public.dashboard_templates SET usage_count = usage_count + 1 WHERE id = template_id;
END;
$f$;

-- 3) take away the right to run the 9 functions from visitors and signed-in users (triggers keep firing)
DO $m$ DECLARE f record; BEGIN
  FOR f IN SELECT p.oid FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.proname IN
    ('fix_null_user_ids','fn_content_posts_auto_populate','increment_template_usage','is_authorized_log_viewer','populate_scheduled_post_from_content','schedule_post','set_default_user_id','sync_external_service_name_to_posts','update_modified_column') LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.oid::regprocedure);
  END LOOP;
END $m$;

-- 4) the schedule screen (owner login) keeps calling it
GRANT EXECUTE ON FUNCTION public.increment_template_usage(uuid) TO authenticated;
