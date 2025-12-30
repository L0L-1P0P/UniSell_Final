-- Add RLS policy to allow admins to update any user profile (for banning)
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.usm_role = 'admin'
  )
);

COMMENT ON POLICY "Admins can update any profile" ON profiles IS 'Allows administrators to update user profiles (for banning, verification status changes, etc.)';
