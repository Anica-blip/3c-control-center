-- Repo path: supabase/migrations/20261122190103_storage_intel_audio_owner_only.sql
-- Storage bucket 'intel-audio': owner only (Standard B9). Project: 3C Control Center.
-- Files stay viewable by their address (the bucket stays public). No rule is left that lets
-- visitors list, upload, replace or delete. Rollback: rollback/20261122190103_storage_intel_audio_owner_only.sql

DROP POLICY IF EXISTS "Authenticated delete intel audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update intel audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to intel audio" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for intel audio" ON storage.objects;

CREATE POLICY "owner_select_intel_audio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'intel-audio' AND (SELECT public.is_owner()));
CREATE POLICY "owner_insert_intel_audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'intel-audio' AND (SELECT public.is_owner()));
CREATE POLICY "owner_update_intel_audio" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'intel-audio' AND (SELECT public.is_owner())) WITH CHECK (bucket_id = 'intel-audio' AND (SELECT public.is_owner()));
CREATE POLICY "owner_delete_intel_audio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'intel-audio' AND (SELECT public.is_owner()));
