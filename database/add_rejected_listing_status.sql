-- Add 'rejected' status to item_status enum and rejection_reason column
-- Run this in your Supabase SQL Editor

-- Add 'rejected' value to the enum if it doesn't exist
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add rejection_reason column to store admin feedback
ALTER TABLE items ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Verify the enum values
-- SELECT enum_range(NULL::item_status);
