-- Repo path: supabase/migrations/20261122190105_storage_avatars_owner_only.sql
-- Storage bucket 'avatars': owner only (Standard B9). Project: 3C Control Center.
-- Files stay viewable by their address (the bucket stays public). No rule is left that lets
-- visitors list, upload, replace or delete. Rollback: rollback/20261122190105_storage_avatars_owner_only.sql

DROP POLICY IF EXISTS "Allow all operations on avatars bucket" ON storage.objects;

CREATE POLICY "owner_select_avatars" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars' AND (SELECT public.is_owner()));
CREATE POLICY "owner_insert_avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (SELECT public.is_owner()));
CREATE POLICY "owner_update_avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (SELECT public.is_owner())) WITH CHECK (bucket_id = 'avatars' AND (SELECT public.is_owner()));
CREATE POLICY "owner_delete_avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (SELECT public.is_owner()));
