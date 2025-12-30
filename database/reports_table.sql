-- SQL to create reports table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either item_id or target_user_id is set (not both)
  CONSTRAINT check_report_target CHECK (
    (item_id IS NOT NULL AND target_user_id IS NULL) OR
    (item_id IS NULL AND target_user_id IS NOT NULL)
  ),
  
  -- Prevent duplicate reports
  CONSTRAINT unique_item_report UNIQUE NULLS NOT DISTINCT (reporter_id, item_id),
  CONSTRAINT unique_user_report UNIQUE NULLS NOT DISTINCT (reporter_id, target_user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_item ON reports(item_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(target_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Policy: Users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Policy: Only admins can update/delete reports (you'll need to add admin check later)
-- For now, no policy for UPDATE/DELETE means only service role can do it
