-- Fix Reports Table RLS Policies
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if any
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;

-- Policy 1: Users can view their own reports (for duplicate check)
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Policy 2: Users can insert reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Verify RLS is enabled
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
