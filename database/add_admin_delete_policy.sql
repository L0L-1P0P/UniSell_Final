-- Add RLS policy to allow admins to delete any listing
CREATE POLICY "Admins can delete any listing"
ON items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.usm_role = 'admin'
  )
);

COMMENT ON POLICY "Admins can delete any listing" ON items IS 'Allows administrators to permanently delete listings from the database';
