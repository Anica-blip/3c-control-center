-- Add missing RLS policy for greeted_users table
CREATE POLICY "Allow all operations on greeted_users" ON greeted_users
FOR ALL USING (true);