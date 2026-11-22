-- Repo path: supabase/migrations/rollback/20261122190102_storage_audio_files_owner_only_rollback.sql
-- Puts back the rules that bucket 'audio-files' had on 22 Nov 2026 (they were open to visitors).
-- Only run this to undo 20261122190102_storage_audio_files_owner_only.sql.

DROP POLICY IF EXISTS "owner_select_audio_files" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_audio_files" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_audio_files" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_audio_files" ON storage.objects;

CREATE POLICY "Allow authenticated users to delete audio" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'audio-files'::text));
CREATE POLICY "Allow authenticated users to upload audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'audio-files'::text));
CREATE POLICY "Allow public to read audio" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'audio-files'::text));
