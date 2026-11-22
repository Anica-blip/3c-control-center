-- Repo path: supabase/migrations/rollback/20261122190103_storage_intel_audio_owner_only_rollback.sql
-- Puts back the rules that bucket 'intel-audio' had on 22 Nov 2026 (they were open to visitors).
-- Only run this to undo 20261122190103_storage_intel_audio_owner_only.sql.

DROP POLICY IF EXISTS "owner_select_intel_audio" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_intel_audio" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_intel_audio" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_intel_audio" ON storage.objects;

CREATE POLICY "Authenticated delete intel audio" ON storage.objects FOR DELETE TO public USING ((bucket_id = 'intel-audio'::text));
CREATE POLICY "Authenticated update intel audio" ON storage.objects FOR UPDATE TO public USING ((bucket_id = 'intel-audio'::text)) WITH CHECK ((bucket_id = 'intel-audio'::text));
CREATE POLICY "Authenticated upload to intel audio" ON storage.objects FOR INSERT TO public WITH CHECK ((bucket_id = 'intel-audio'::text));
CREATE POLICY "Public read access for intel audio" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'intel-audio'::text));
