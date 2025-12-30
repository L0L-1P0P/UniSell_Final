-- Alternative RLS policy with simpler syntax
-- First, drop the existing policy if it exists
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create new policy with different syntax
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT usm_role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT usm_role FROM profiles WHERE id = auth.uid()) = 'admin'
);

COMMENT ON POLICY "Admins can update any profile" ON profiles IS 'Allows administrators to update user profiles (for banning, verification status changes, etc.)';
