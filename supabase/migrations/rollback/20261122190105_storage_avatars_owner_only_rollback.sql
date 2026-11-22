-- Repo path: supabase/migrations/rollback/20261122190105_storage_avatars_owner_only_rollback.sql
-- Puts back the rules that bucket 'avatars' had on 22 Nov 2026 (they were open to visitors).
-- Only run this to undo 20261122190105_storage_avatars_owner_only.sql.

DROP POLICY IF EXISTS "owner_select_avatars" ON storage.objects;
DROP POLICY IF EXISTS "owner_insert_avatars" ON storage.objects;
DROP POLICY IF EXISTS "owner_update_avatars" ON storage.objects;
DROP POLICY IF EXISTS "owner_delete_avatars" ON storage.objects;

CREATE POLICY "Allow all operations on avatars bucket" ON storage.objects FOR ALL TO public USING ((bucket_id = 'avatars'::text));
