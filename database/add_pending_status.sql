-- Add 'pending' to item_status enum
-- Run this in your Supabase SQL Editor

-- Add 'pending' value to the enum if it doesn't exist
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'pending';

-- Verify the enum values
-- SELECT enum_range(NULL::item_status);
