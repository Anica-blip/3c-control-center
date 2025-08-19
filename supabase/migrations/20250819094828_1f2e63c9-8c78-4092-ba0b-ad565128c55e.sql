-- Let's check if there are any users and update the profiles accordingly
-- If no users exist, we'll create a placeholder or handle this differently

DO $$
DECLARE
    user_count INTEGER;
    first_user_id UUID;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    IF user_count > 0 THEN
        -- Get the first user ID
        SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
        
        -- Update character profiles with this user ID
        UPDATE public.character_profiles 
        SET user_id = first_user_id
        WHERE user_id IS NULL;
        
        RAISE NOTICE 'Updated character profiles with user_id: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;