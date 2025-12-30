-- Add admin policy to allow admins to update any listing
-- This is needed for the listing approval/rejection feature
-- Run this in your Supabase SQL Editor

-- Create a policy to allow admins to update any item
CREATE POLICY "Admins can update any item" ON public.items
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND usm_role = 'admin'
    )
  );

-- Verify the policies
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'items' ORDER BY cmd;
