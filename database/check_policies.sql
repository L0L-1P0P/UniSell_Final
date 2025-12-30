-- First, let's check if there are any conflicting UPDATE policies
-- Run this to see all UPDATE policies on profiles:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- If you see policies that might conflict, we may need to modify them
