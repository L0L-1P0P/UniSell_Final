-- Add RLS policy to allow admins to delete any user profile
CREATE POLICY "Admins can delete any profile"
ON profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.usm_role = 'admin'
  )
);

COMMENT ON POLICY "Admins can delete any profile" ON profiles IS 'Allows administrators to permanently delete user accounts and all associated data';
