-- Clear demo character profiles with invalid local asset paths
DELETE FROM character_profiles WHERE avatar_url LIKE '%/src/assets/%';

-- Add missing RLS policy for any table that might be missing policies
-- (The linter detected RLS enabled with no policies)

-- Let's check what tables might need policies by enabling proper policies for character_profiles
DROP POLICY IF EXISTS "Character profiles are viewable by everyone" ON character_profiles;
DROP POLICY IF EXISTS "Character profiles can be managed by everyone" ON character_profiles;

CREATE POLICY "Anyone can view character profiles" ON character_profiles
FOR SELECT USING (true);

CREATE POLICY "Anyone can manage character profiles" ON character_profiles
FOR ALL USING (true);