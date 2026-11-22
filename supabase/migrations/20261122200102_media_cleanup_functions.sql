-- 3C Control Center - media clean-up, step 2 of 2
-- Two owner-only functions. They never delete files (SQL cannot); the dashboard deletes
-- through the storage service after Chef confirms the list.
--   media_cleanup_report()      lists files in content-media that can safely go:
--       kind 'unused' = no row in any post table or template points at the file
--       kind 'sent'   = every post using the file is complete and sent, no waiting copy
--                       in content_posts / scheduled_posts, and no template uses it
--   media_mark_removed(names)   stamps media_removed_at on dashboard_posts rows whose
--                               files are really gone from the bucket
-- The in-use check runs inside the database so it sees every row (the worker's rows
-- belong to the placeholder owner and are hidden from the browser by the table rules).
-- Rollback: rollback/20261122200102_media_cleanup_functions.sql

CREATE OR REPLACE FUNCTION public.media_cleanup_report()
RETURNS TABLE (kind text, name text, size_bytes bigint, uploaded_at timestamptz, used_by text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
#variable_conflict use_column
BEGIN
  IF NOT (SELECT public.is_owner()) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH
  tpl AS (
    SELECT coalesce(string_agg(to_jsonb(t)::text, ' '), '') AS b FROM public.dashboard_templates t
  ),
  pcl AS (
    SELECT coalesce(string_agg(to_jsonb(p)::text, ' '), '') AS b FROM public.pending_content_library p
  ),
  objs AS (
    SELECT o.name AS oname,
           coalesce((o.metadata->>'size')::bigint, 0) AS sz,
           o.created_at AS cat,
           replace(o.name, ' ', '%20') AS enc
    FROM storage.objects o
    WHERE o.bucket_id = 'content-media'
  ),
  refs AS (
    SELECT ob.oname AS rname, 'dashboard_posts'::text AS src, d.id::text AS rid,
           (d.status = 'complete' AND d.delivery_status = 'sent') AS done
    FROM objs ob
    JOIN public.dashboard_posts d
      ON strpos(to_jsonb(d)::text, ob.oname) > 0 OR strpos(to_jsonb(d)::text, ob.enc) > 0
    UNION ALL
    SELECT ob.oname, 'content_posts'::text, c.id::text,
           EXISTS (SELECT 1 FROM public.dashboard_posts d2
                   WHERE d2.content_id = c.content_id
                     AND d2.status = 'complete' AND d2.delivery_status = 'sent')
    FROM objs ob
    JOIN public.content_posts c
      ON strpos(to_jsonb(c)::text, ob.oname) > 0 OR strpos(to_jsonb(c)::text, ob.enc) > 0
    UNION ALL
    SELECT ob.oname, 'scheduled_posts'::text, s.id::text,
           EXISTS (SELECT 1 FROM public.dashboard_posts d3
                   WHERE d3.content_id = s.content_id
                     AND d3.status = 'complete' AND d3.delivery_status = 'sent')
    FROM objs ob
    JOIN public.scheduled_posts s
      ON strpos(to_jsonb(s)::text, ob.oname) > 0 OR strpos(to_jsonb(s)::text, ob.enc) > 0
  ),
  free_of_templates AS (
    SELECT ob.oname AS fname
    FROM objs ob, tpl, pcl
    WHERE strpos(tpl.b, ob.oname) = 0 AND strpos(tpl.b, ob.enc) = 0
      AND strpos(pcl.b, ob.oname) = 0 AND strpos(pcl.b, ob.enc) = 0
  )
  SELECT 'unused'::text, ob.oname, ob.sz, ob.cat, ''::text
  FROM objs ob
  WHERE ob.oname IN (SELECT fname FROM free_of_templates)
    AND NOT EXISTS (SELECT 1 FROM refs r WHERE r.rname = ob.oname)
  UNION ALL
  SELECT 'sent'::text, ob.oname, ob.sz, ob.cat,
         (SELECT string_agg(r.src || ':' || r.rid, ', ' ORDER BY r.src, r.rid)
          FROM refs r WHERE r.rname = ob.oname)
  FROM objs ob
  WHERE ob.oname IN (SELECT fname FROM free_of_templates)
    AND EXISTS (SELECT 1 FROM refs r WHERE r.rname = ob.oname AND r.src = 'dashboard_posts')
    AND NOT EXISTS (SELECT 1 FROM refs r WHERE r.rname = ob.oname AND NOT r.done)
  ORDER BY 1, 4, 2;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.media_mark_removed(p_names text[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  n integer;
BEGIN
  IF NOT (SELECT public.is_owner()) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  UPDATE public.dashboard_posts d
  SET media_removed_at = now()
  WHERE d.media_removed_at IS NULL
    AND EXISTS (
      SELECT 1 FROM unnest(p_names) AS x(nm)
      WHERE strpos(to_jsonb(d)::text, x.nm) > 0
        AND NOT EXISTS (SELECT 1 FROM storage.objects so
                        WHERE so.bucket_id = 'content-media' AND so.name = x.nm)
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$fn$;

REVOKE ALL ON FUNCTION public.media_cleanup_report() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.media_mark_removed(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.media_cleanup_report() TO authenticated;
GRANT EXECUTE ON FUNCTION public.media_mark_removed(text[]) TO authenticated;
