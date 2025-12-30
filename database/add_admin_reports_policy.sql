-- Add Admin Policy for Reports Table
-- Run this in your Supabase SQL Editor

-- Add policy for admins to view all reports
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.usm_role = 'admin'
    )
  );

-- Add policy for admins to update reports
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.usm_role = 'admin'
    )
  );

-- Add policy for admins to delete reports (if needed)
CREATE POLICY "Admins can delete reports"
  ON reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.usm_role = 'admin'
    )
  );
