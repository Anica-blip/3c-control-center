-- Repo path: supabase/migrations/20261122190102_storage_audio_files_owner_only.sql
-- Storage bucket 'audio-files': owner only (Standard B9). Project: 3C Control Center.
-- Files stay viewable by their address (the bucket stays public). No rule is left that lets
-- visitors list, upload, replace or delete. Rollback: rollback/20261122190102_storage_audio_files_owner_only.sql

DROP POLICY IF EXISTS "Allow authenticated users to delete audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read audio" ON storage.objects;

CREATE POLICY "owner_select_audio_files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'audio-files' AND (SELECT public.is_owner()));
CREATE POLICY "owner_insert_audio_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio-files' AND (SELECT public.is_owner()));
CREATE POLICY "owner_update_audio_files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'audio-files' AND (SELECT public.is_owner())) WITH CHECK (bucket_id = 'audio-files' AND (SELECT public.is_owner()));
CREATE POLICY "owner_delete_audio_files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'audio-files' AND (SELECT public.is_owner()));
